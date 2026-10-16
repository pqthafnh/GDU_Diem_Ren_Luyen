"""Transactional ticket and waitlist business rules."""

import asyncio
from uuid import UUID

from psycopg import AsyncConnection
from psycopg.errors import DeadlockDetected, SerializationFailure

from app.modules.registrations.schemas import (
    RegistrationRequest,
    TicketListResponse,
    TicketResponse,
)


class RegistrationService:
    """Registers students with event row locking to prevent overselling."""

    async def register(
        self,
        connection: AsyncConnection,
        event_id: UUID,
        student_id: UUID,
        body: RegistrationRequest,
    ) -> TicketResponse:
        """Create a ticket, retrying bounded PostgreSQL serialization conflicts."""
        for attempt in range(3):
            try:
                return await self._register_once(connection, event_id, student_id, body)
            except (DeadlockDetected, SerializationFailure):
                if attempt == 2:
                    raise
                await asyncio.sleep(0.02 * (attempt + 1))
        raise RuntimeError("Registration retry loop exited unexpectedly")

    async def _register_once(
        self,
        connection: AsyncConnection,
        event_id: UUID,
        student_id: UUID,
        body: RegistrationRequest,
    ) -> TicketResponse:
        """Create one official or waitlist ticket atomically."""
        body.validate_confirmation()
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """SELECT event_type, status, capacity
                       FROM events WHERE id = %s AND deleted_at IS NULL FOR UPDATE""",
                    (event_id,),
                )
                event_row = await cursor.fetchone()
                if event_row is None:
                    raise ValueError("Event is not available for registration")
                event = event_row
                if event[1] != "PUBLISHED":
                    raise ValueError("Event is not available for registration")
                if event[0] == "INTERACTIVE":
                    raise ValueError("Interactive events do not use tickets")
                await cursor.execute(
                    "SELECT id FROM tickets WHERE event_id = %s AND student_id = %s "
                    "AND status IN ('OFFICIAL', 'WAITLIST')",
                    (event_id, student_id),
                )
                if await cursor.fetchone() is not None:
                    raise RuntimeError("Student is already registered")
                await cursor.execute(
                    "UPDATE users SET phone_number = %s WHERE id = %s",
                    (body.phone_number, student_id),
                )
                await cursor.execute(
                    "SELECT COUNT(*) FROM tickets WHERE event_id = %s AND status = 'OFFICIAL'",
                    (event_id,),
                )
                official_row = await cursor.fetchone()
                if official_row is None:
                    raise RuntimeError("Official ticket count unavailable")
                official_count = int(official_row[0])
                if official_count < int(event[2]):
                    ticket_status = "OFFICIAL"
                    queue_number = official_count + 1
                    waitlist_position = None
                    seat_number = f"A-{queue_number}"
                else:
                    await cursor.execute(
                        "SELECT COUNT(*) FROM tickets WHERE event_id = %s AND status = 'WAITLIST'",
                        (event_id,),
                    )
                    waitlist_row = await cursor.fetchone()
                    if waitlist_row is None:
                        raise RuntimeError("Waitlist count unavailable")
                    waitlist_position = int(waitlist_row[0]) + 1
                    ticket_status = "WAITLIST"
                    queue_number = int(event[2]) + waitlist_position
                    seat_number = None
                await cursor.execute(
                    """INSERT INTO tickets
                       (event_id, student_id, status, queue_number, waitlist_position,
                        seat_number, contact_phone, note)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                       RETURNING id, status, queue_number, waitlist_position, seat_number,
                                 contact_phone, registered_at""",
                    (
                        event_id,
                        student_id,
                        ticket_status,
                        queue_number,
                        waitlist_position,
                        seat_number,
                        body.phone_number,
                        body.note,
                    ),
                )
                row = await cursor.fetchone()
                if row is None:
                    raise RuntimeError("Ticket insert returned no row")
        return TicketResponse(
            id=row[0],
            status=row[1],
            queueNumber=row[2],
            waitlistPosition=row[3],
            seatNumber=row[4],
            contactPhone=row[5],
            registeredAt=row[6],
        )

    async def cancel(self, connection: AsyncConnection, ticket_id: UUID, student_id: UUID) -> None:
        """Cancel a ticket within 48 hours and promote the first waitlisted student."""
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """SELECT event_id FROM tickets
                       WHERE id = %s AND student_id = %s
                         AND status IN ('OFFICIAL', 'WAITLIST')
                         AND registered_at >= CURRENT_TIMESTAMP - INTERVAL '48 hours'
                       FOR UPDATE""",
                    (ticket_id, student_id),
                )
                ticket = await cursor.fetchone()
                if ticket is None:
                    raise ValueError("Ticket cannot be cancelled after 48 hours")
                event_id = ticket[0]
                await cursor.execute("SELECT id FROM events WHERE id = %s FOR UPDATE", (event_id,))
                await cursor.execute(
                    """UPDATE tickets SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP
                       WHERE id = %s""",
                    (ticket_id,),
                )
                await cursor.execute(
                    """SELECT id FROM tickets WHERE event_id = %s AND status = 'WAITLIST'
                       ORDER BY waitlist_position ASC LIMIT 1 FOR UPDATE""",
                    (event_id,),
                )
                promoted = await cursor.fetchone()
                if promoted is not None:
                    await cursor.execute(
                        """UPDATE tickets SET status = 'OFFICIAL', waitlist_position = NULL,
                                  seat_number = 'A-' || queue_number
                           WHERE id = %s""",
                        (promoted[0],),
                    )
                    await cursor.execute(
                        """UPDATE tickets SET waitlist_position = waitlist_position - 1
                           WHERE event_id = %s AND status = 'WAITLIST'""",
                        (event_id,),
                    )

    async def list_for_student(
        self, connection: AsyncConnection, student_id: UUID
    ) -> list[TicketListResponse]:
        """Return the authenticated student's active and cancelled tickets."""
        async with connection.cursor() as cursor:
            await cursor.execute(
                """SELECT t.id, t.event_id, e.title, t.status, t.queue_number,
                      t.waitlist_position, t.seat_number, t.contact_phone,
                      t.registered_at, t.cancelled_at
                   FROM tickets t
                   JOIN events e ON e.id = t.event_id
                   WHERE t.student_id = %s
                   ORDER BY t.registered_at DESC""",
                (student_id,),
            )
            rows = await cursor.fetchall()
        return [
            TicketListResponse(
                id=row[0],
                eventId=row[1],
                eventTitle=row[2],
                status=row[3],
                queueNumber=row[4],
                waitlistPosition=row[5],
                seatNumber=row[6],
                contactPhone=row[7],
                registeredAt=row[8],
                cancelledAt=row[9],
            )
            for row in rows
        ]
