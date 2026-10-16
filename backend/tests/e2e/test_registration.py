"""End-to-end registration and waitlist invariants."""

from uuid import UUID, uuid4

import pytest
from httpx import AsyncClient

from app.config.settings import get_settings
from app.database.pool import Database
from app.shared.security import create_access_token, hash_password


async def _students(database: Database, count: int) -> list[UUID]:
    """Create students and return their IDs."""
    ids: list[UUID] = []
    async with database.connection() as connection:
        async with connection.transaction():
            for index in range(count):
                cursor = await connection.execute(
                    """INSERT INTO users
                       (student_id, last_name, first_name, full_name, birth_date, email,
                        password_hash, is_password_changed, role)
                       VALUES (%s, 'Test', %s, %s, '2000-01-01', %s, %s, TRUE, 'STUDENT')
                       RETURNING id""",
                    (
                        f"reg-{uuid4().hex[:8]}",
                        str(index),
                        f"Registration {index}",
                        f"reg-{uuid4().hex[:8]}@test.gdu.edu.vn",
                        hash_password("Student@123"),
                    ),
                )
                row = await cursor.fetchone()
                assert row is not None
                ids.append(row[0])
    return ids


def _headers(user_id: UUID) -> dict[str, str]:
    """Build a student bearer token for the test user."""
    settings = get_settings()
    token = create_access_token(
        user_id,
        "STUDENT",
        f"{user_id}@test.gdu.edu.vn",
        settings.jwt_secret,
        settings.jwt_issuer,
        settings.jwt_audience,
        60,
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_registration_waitlist_promotion_and_duplicate_protection(
    client: AsyncClient, database: Database, standard_event: UUID
) -> None:
    """Fill capacity, verify waitlist order, then promote the first waiter."""
    students = await _students(database, 7)
    tickets: list[dict[str, object]] = []
    for student_id in students:
        response = await client.post(
            f"/api/student/events/{standard_event}/register",
            json={"phoneNumber": "0901234567", "confirmCorrect": True},
            headers=_headers(student_id),
        )
        assert response.status_code == 201
        tickets.append(response.json())
    assert [ticket["status"] for ticket in tickets] == [
        "OFFICIAL",
        "OFFICIAL",
        "OFFICIAL",
        "OFFICIAL",
        "OFFICIAL",
        "WAITLIST",
        "WAITLIST",
    ]
    assert tickets[5]["waitlistPosition"] == 1
    assert tickets[6]["waitlistPosition"] == 2

    duplicate = await client.post(
        f"/api/student/events/{standard_event}/register",
        json={"phoneNumber": "0901234567", "confirmCorrect": True},
        headers=_headers(students[0]),
    )
    assert duplicate.status_code == 409

    cancelled = await client.post(
        f"/api/student/tickets/{tickets[0]['id']}/cancel",
        headers=_headers(students[0]),
    )
    assert cancelled.status_code == 200
    async with database.connection() as connection:
        cursor = await connection.execute(
            "SELECT status, waitlist_position FROM tickets WHERE id = %s",
            (tickets[5]["id"],),
        )
        promoted = await cursor.fetchone()
        cursor = await connection.execute(
            "SELECT COUNT(*) FROM tickets WHERE event_id = %s AND status = 'OFFICIAL'",
            (standard_event,),
        )
        official_count = await cursor.fetchone()
    assert promoted == ("OFFICIAL", None)
    assert official_count == (5,)
