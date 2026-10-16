"""Authorized append-only training points corrections."""

from uuid import UUID

from psycopg import AsyncConnection
from psycopg.types.json import Json


class LedgerCorrectionService:
    """Creates immutable adjustment entries instead of mutating history."""

    async def correct(
        self,
        connection: AsyncConnection,
        source_entry_id: UUID,
        actor_id: UUID,
        points: int,
        reason: str,
        idempotency_key: str,
    ) -> UUID:
        """Insert one correction entry and audit it atomically."""
        if not reason.strip():
            raise ValueError("Correction reason is required")
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """SELECT student_id, event_id, criteria_category, semester, academic_year
                       FROM training_points_ledger WHERE id = %s FOR UPDATE""",
                    (source_entry_id,),
                )
                source = await cursor.fetchone()
                if source is None:
                    raise ValueError("Source ledger entry not found")
                await cursor.execute(
                    """INSERT INTO training_points_ledger
                       (student_id, event_id, points_awarded, criteria_category, semester,
                        academic_year, note, source_type, source_id, idempotency_key,
                        awarded_by, metadata, correction_of)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, 'ADJUSTMENT', %s, %s, %s, %s, %s)
                       ON CONFLICT (idempotency_key) DO NOTHING
                       RETURNING id""",
                    (
                        source[0],
                        source[1],
                        points,
                        source[2],
                        source[3],
                        source[4],
                        reason,
                        source_entry_id,
                        idempotency_key,
                        actor_id,
                        Json({"reason": reason}),
                        source_entry_id,
                    ),
                )
                row = await cursor.fetchone()
                if row is None:
                    await cursor.execute(
                        "SELECT id FROM training_points_ledger WHERE idempotency_key = %s",
                        (idempotency_key,),
                    )
                    existing = await cursor.fetchone()
                    if existing is None:
                        raise RuntimeError("Correction insert returned no row")
                    if not isinstance(existing[0], UUID):
                        raise RuntimeError("Correction identifier is invalid")
                    return existing[0]
                await cursor.execute(
                    """INSERT INTO system_audit_logs
                       (admin_id, action, target_type, target_id, details)
                       VALUES (%s, 'ADJUST_POINTS', 'TRAINING_LEDGER', %s, %s::jsonb)""",
                    (
                        actor_id,
                        row[0],
                        Json({"sourceEntryId": str(source_entry_id), "reason": reason}),
                    ),
                )
                if not isinstance(row[0], UUID):
                    raise RuntimeError("Correction identifier is invalid")
                return row[0]
