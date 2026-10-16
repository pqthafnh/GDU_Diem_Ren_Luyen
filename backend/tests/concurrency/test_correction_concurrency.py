"""PostgreSQL concurrency coverage for append-only correction idempotency."""

import asyncio
from uuid import UUID

import pytest

from app.database.pool import Database
from app.modules.training_points.correction import LedgerCorrectionService


@pytest.mark.asyncio
async def test_correction_same_idempotency_key_creates_one_entry(
    database: Database, seeded_users: dict[str, UUID], standard_event: UUID
) -> None:
    """Concurrent correction retries return one immutable correction row."""
    async with database.connection() as connection:
        cursor = await connection.execute(
            """INSERT INTO training_points_ledger
               (student_id, event_id, points_awarded, criteria_category, semester,
                academic_year, note, source_type, source_id, idempotency_key, awarded_by, metadata)
               VALUES (%s, %s, 2, 'ACADEMIC', 'HK1', '2026-2027', 'source',
                       'ATTENDANCE', %s, %s, %s, '{}'::jsonb)
               RETURNING id""",
            (
                seeded_users["STUDENT"],
                standard_event,
                standard_event,
                f"source:{standard_event}",
                seeded_users["ADMIN"],
            ),
        )
        row = await cursor.fetchone()
    assert row is not None
    source_id = row[0]

    async def correct() -> UUID:
        async with database.connection() as connection:
            return await LedgerCorrectionService().correct(
                connection,
                source_id,
                seeded_users["ADMIN"],
                -1,
                "Concurrent correction",
                "same-key",
            )

    correction_ids = await asyncio.gather(*(correct() for _ in range(10)))
    assert len(set(correction_ids)) == 1
    async with database.connection() as connection:
        cursor = await connection.execute(
            "SELECT COUNT(*) FROM training_points_ledger WHERE idempotency_key = %s",
            ("same-key",),
        )
        count = await cursor.fetchone()
    assert count == (1,)
