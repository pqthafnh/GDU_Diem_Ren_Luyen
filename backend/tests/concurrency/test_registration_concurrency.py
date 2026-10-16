"""Registration concurrency tests against PostgreSQL."""

import asyncio
from uuid import UUID, uuid4

import pytest

from app.database.pool import Database
from app.modules.registrations.schemas import RegistrationRequest
from app.modules.registrations.service import RegistrationService


@pytest.mark.asyncio
async def test_concurrent_registration_never_oversells(
    database: Database, standard_event: UUID, seeded_users: dict[str, UUID]
) -> None:
    """Concurrent registrations preserve the five-seat capacity invariant."""
    service = RegistrationService()
    student_ids: list[UUID] = []
    async with database.connection() as connection:
        for index in range(100):
            cursor = await connection.execute(
                """INSERT INTO users
                   (student_id, last_name, first_name, full_name, birth_date, email,
                    password_hash, is_password_changed, role)
                   VALUES (%s, 'Race', %s, %s, '2000-01-01', %s, %s, TRUE, 'STUDENT')
                   RETURNING id""",
                (
                    f"race-{index}-{uuid4().hex[:6]}",
                    str(index),
                    f"Race {index}",
                    f"race-{index}-{uuid4()}@test.gdu.edu.vn",
                    "hash",
                ),
            )
            row = await cursor.fetchone()
            if row is None:
                raise RuntimeError("race student insert failed")
            student_ids.append(row[0])

    async def register(student_id: UUID) -> str:
        async with database.connection() as connection:
            ticket = await service.register(
                connection,
                standard_event,
                student_id,
                RegistrationRequest(phoneNumber="0912345678", confirmCorrect=True),
            )
            return ticket.status

    statuses = await asyncio.gather(*(register(student_id) for student_id in student_ids))
    assert statuses.count("OFFICIAL") == 5
    assert statuses.count("WAITLIST") == 95
    async with database.connection() as connection:
        cursor = await connection.execute(
            "SELECT COUNT(DISTINCT queue_number), COUNT(DISTINCT waitlist_position) "
            "FROM tickets WHERE event_id = %s AND status = 'WAITLIST'",
            (standard_event,),
        )
        row = await cursor.fetchone()
    assert row == (95, 95)
