"""PostgreSQL concurrency coverage for ticket cancellation and promotion."""

import asyncio
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest

from app.database.pool import Database
from app.modules.registrations.service import RegistrationService


@pytest.mark.asyncio
async def test_concurrent_cancellations_preserve_waitlist_invariants(
    database: Database, seeded_users: dict[str, UUID]
) -> None:
    """Concurrent cancellations promote each waitlist ticket at most once."""
    event_id = uuid4()
    students = [seeded_users["STUDENT"]]
    async with database.connection() as connection:
        async with connection.transaction():
            for index in range(9):
                cursor = await connection.execute(
                    """INSERT INTO users
                       (student_id, last_name, first_name, full_name, birth_date, email,
                        password_hash, is_password_changed, role)
                       VALUES (%s, 'Test', %s, %s, '2000-01-01', %s, 'hash', TRUE, 'STUDENT')
                       RETURNING id""",
                    (
                        f"cancel-{index}-{uuid4().hex[:8]}",
                        str(index),
                        f"Cancel {index}",
                        f"cancel-{index}-{uuid4()}@test.gdu.edu.vn",
                    ),
                )
                row = await cursor.fetchone()
                assert row is not None
                students.append(row[0])
            await connection.execute(
                """INSERT INTO events
                   (id, title, description, category, event_type, check_in_method,
                    start_time, end_time, location_name, capacity, status, created_by)
                   VALUES (%s, 'Cancellation race', 'Race', 'ACADEMIC', 'STANDARD',
                           'MANUAL_ROLLCALL', %s, %s, 'GDU', 5, 'PUBLISHED', %s)""",
                (
                    event_id,
                    datetime.now(UTC) - timedelta(hours=1),
                    datetime.now(UTC) + timedelta(hours=1),
                    seeded_users["MOD"],
                ),
            )
            for index, student_id in enumerate(students):
                status = "OFFICIAL" if index < 5 else "WAITLIST"
                waitlist_position = index - 4 if status == "WAITLIST" else None
                queue_number = index + 1
                await connection.execute(
                    """INSERT INTO tickets
                       (event_id, student_id, status, queue_number, waitlist_position, seat_number)
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (
                        event_id,
                        student_id,
                        status,
                        queue_number,
                        waitlist_position,
                        f"A-{queue_number}" if status == "OFFICIAL" else None,
                    ),
                )
            cursor = await connection.execute(
                "SELECT id FROM tickets WHERE event_id = %s AND status = 'OFFICIAL' "
                "ORDER BY queue_number",
                (event_id,),
            )
            official_ids = [row[0] for row in await cursor.fetchall()]

    async def cancel(ticket_id: UUID, student_id: UUID) -> None:
        async with database.connection() as connection:
            await RegistrationService().cancel(connection, ticket_id, student_id)

    await asyncio.gather(
        *(cancel(ticket_id, students[index]) for index, ticket_id in enumerate(official_ids[:3]))
    )

    async with database.connection() as connection:
        cursor = await connection.execute(
            "SELECT status, COUNT(*) FROM tickets WHERE event_id = %s GROUP BY status",
            (event_id,),
        )
        counts = dict(await cursor.fetchall())
        assert counts["OFFICIAL"] == 5
        assert counts["CANCELLED"] == 3
        cursor = await connection.execute(
            """SELECT waitlist_position FROM tickets
               WHERE event_id = %s AND status = 'WAITLIST'
               ORDER BY waitlist_position""",
            (event_id,),
        )
        assert [row[0] for row in await cursor.fetchall()] == [1, 2]
        cursor = await connection.execute(
            """SELECT COUNT(*), COUNT(DISTINCT queue_number)
               FROM tickets WHERE event_id = %s AND status <> 'CANCELLED'""",
            (event_id,),
        )
        assert await cursor.fetchone() == (7, 7)
        cursor = await connection.execute(
            "SELECT id FROM tickets WHERE event_id = %s AND status = 'CANCELLED'",
            (event_id,),
        )
        cancelled_id = (await cursor.fetchone())[0]

    async with database.connection() as connection:
        with pytest.raises(ValueError):
            await RegistrationService().cancel(connection, cancelled_id, students[0])
