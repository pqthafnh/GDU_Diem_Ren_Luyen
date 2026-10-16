"""Registration integration tests against PostgreSQL."""

from uuid import UUID, uuid4

import pytest

from app.database.pool import Database
from app.modules.registrations.schemas import RegistrationRequest
from app.modules.registrations.service import RegistrationService


@pytest.mark.asyncio
async def test_registration_promotes_waitlist_and_renumbers(
    database: Database, standard_event: UUID, seeded_users: dict[str, UUID]
) -> None:
    """A cancelled official ticket promotes exactly the first waitlisted ticket."""
    service = RegistrationService()
    students = [seeded_users["STUDENT"]]
    async with database.connection() as connection:
        ticket = await service.register(
            connection,
            standard_event,
            students[0],
            RegistrationRequest(phoneNumber="0912345678", confirmCorrect=True),
        )
        await connection.execute(
            """UPDATE events SET capacity = 1 WHERE id = %s""", (standard_event,)
        )
        extra_ids: list[UUID] = []
        for index in range(2):
            cursor = await connection.execute(
                """INSERT INTO users
                   (student_id, last_name, first_name, full_name, birth_date, email,
                    password_hash, is_password_changed, role)
                   VALUES (%s, 'Test', %s, %s, '2000-01-01', %s, %s, TRUE, 'STUDENT')
                   RETURNING id""",
                (
                    f"wait-{uuid4().hex[:8]}",
                    str(index),
                    f"Wait {index}",
                    f"wait-{uuid4()}@test.gdu.edu.vn",
                    "hash",
                ),
            )
            row = await cursor.fetchone()
            if row is None:
                raise RuntimeError("student insert failed")
            extra_ids.append(row[0])
        await service.register(
            connection,
            standard_event,
            extra_ids[0],
            RegistrationRequest(phoneNumber="0912345678", confirmCorrect=True),
        )
        second = await service.register(
            connection,
            standard_event,
            extra_ids[1],
            RegistrationRequest(phoneNumber="0912345678", confirmCorrect=True),
        )
        await service.cancel(connection, ticket.id, students[0])
        rows = await connection.execute(
            "SELECT student_id, status, waitlist_position FROM tickets WHERE event_id = %s "
            "ORDER BY queue_number",
            (standard_event,),
        )
        tickets = await rows.fetchall()
    assert second.status == "WAITLIST"
    assert any(row[0] == extra_ids[0] and row[1] == "OFFICIAL" for row in tickets)
    assert any(row[0] == extra_ids[1] and row[2] == 1 for row in tickets)
