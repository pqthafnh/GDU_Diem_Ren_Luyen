"""PostgreSQL concurrency coverage for event finalization."""

import asyncio
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest

from app.database.pool import Database
from app.modules.events.finalization import EventFinalizationService


@pytest.mark.asyncio
async def test_finalization_concurrency_is_single_transition(
    database: Database, seeded_users: dict[str, UUID]
) -> None:
    """Concurrent finalization requests produce one completed transition and audit."""
    event_id = uuid4()
    start = datetime.now(UTC) - timedelta(hours=3)
    async with database.connection() as connection:
        await connection.execute(
            """INSERT INTO events
               (id, title, description, category, event_type, check_in_method,
                start_time, end_time, location_name, capacity, points_reward,
                status, created_by)
               VALUES (%s, 'Finalize', 'Concurrency', 'ACADEMIC', 'STANDARD', 'MANUAL_ROLLCALL',
                       %s, %s, 'GDU', 5, 2, 'PUBLISHED', %s)""",
            (event_id, start, start + timedelta(hours=1), seeded_users["MOD"]),
        )

    async def finalize() -> str:
        async with database.connection() as connection:
            return await EventFinalizationService().finalize(
                connection, event_id, seeded_users["MOD"]
            )

    results = await asyncio.gather(*(finalize() for _ in range(10)))
    assert results == ["COMPLETED"] * 10
    async with database.connection() as connection:
        cursor = await connection.execute("SELECT status FROM events WHERE id = %s", (event_id,))
        status = await cursor.fetchone()
        cursor = await connection.execute(
            "SELECT COUNT(*) FROM system_audit_logs "
            "WHERE target_id = %s AND action = 'FINALIZE_EVENT'",
            (event_id,),
        )
        audits = await cursor.fetchone()
    assert status == ("COMPLETED",)
    assert audits == (1,)
