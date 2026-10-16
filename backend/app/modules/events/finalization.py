"""Atomic event finalization workflow."""

from datetime import UTC, datetime
from uuid import UUID

from psycopg import AsyncConnection


class EventFinalizationService:
    """Closes completed events without duplicating their ledger entries."""

    async def finalize(self, connection: AsyncConnection, event_id: UUID, actor_id: UUID) -> str:
        """Lock and finalize an owned event, writing an audit record."""
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """SELECT status, end_time, created_by
                       FROM events WHERE id = %s FOR UPDATE""",
                    (event_id,),
                )
                event = await cursor.fetchone()
                if event is None:
                    raise ValueError("Event not found")
                if event[2] != actor_id:
                    await cursor.execute("SELECT role FROM users WHERE id = %s", (actor_id,))
                    role = await cursor.fetchone()
                    if role is None or role[0] != "ADMIN":
                        raise ValueError("Actor is not allowed to finalize this event")
                if event[0] == "COMPLETED":
                    return "COMPLETED"
                if event[0] not in {"PUBLISHED", "IN_PROGRESS"}:
                    raise ValueError("Event is not eligible for finalization")
                if event[1] > datetime.now(UTC):
                    raise ValueError("Event has not ended")
                await cursor.execute(
                    """UPDATE events SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP,
                              updated_at = CURRENT_TIMESTAMP
                       WHERE id = %s""",
                    (event_id,),
                )
                await cursor.execute(
                    """INSERT INTO system_audit_logs
                       (admin_id, action, target_type, target_id, details)
                       VALUES (%s, 'FINALIZE_EVENT', 'EVENT', %s,
                               '{"status":"COMPLETED"}'::jsonb)""",
                    (actor_id, event_id),
                )
        return "COMPLETED"
