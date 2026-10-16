"""Transactional event lifecycle services."""

from uuid import UUID

from psycopg import AsyncConnection

from app.modules.events.schemas import EventCreate, EventListItem, EventResponse, ReviewDecision


class EventService:
    """Persists event drafts and enforces lifecycle transitions."""

    async def create_draft(
        self, connection: AsyncConnection, body: EventCreate, created_by: UUID
    ) -> EventResponse:
        """Create a draft event owned by a MOD account.

        The insert and response read are performed in the caller's transaction.
        """
        async with connection.cursor() as cursor:
            await cursor.execute(
                """INSERT INTO events
                   (title, description, category, event_type, check_in_method, start_time, end_time,
                    location_name, gps_lat, gps_lng, capacity, points_reward, created_by)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   RETURNING id, title, description, category, event_type, status, start_time,
                             end_time, location_name, capacity, points_reward
                """,
                (
                    body.title,
                    body.description,
                    body.category,
                    body.event_type,
                    body.check_in_method,
                    body.start_time,
                    body.end_time,
                    body.location_name,
                    body.gps_lat,
                    body.gps_lng,
                    body.capacity,
                    body.points_reward,
                    created_by,
                ),
            )
            row = await cursor.fetchone()
        if row is None:
            raise RuntimeError("Event insert returned no row")
        return EventResponse(
            id=row[0],
            title=row[1],
            description=row[2],
            category=row[3],
            eventType=row[4],
            status=row[5],
            startTime=row[6],
            endTime=row[7],
            locationName=row[8],
            capacity=row[9],
            pointsReward=row[10],
        )

    async def submit(self, connection: AsyncConnection, event_id: UUID, owner_id: UUID) -> str:
        """Move an owned DRAFT or CHANGES_REQUESTED event to review."""
        async with connection.cursor() as cursor:
            await cursor.execute(
                """UPDATE events SET status = 'PENDING_REVIEW', updated_at = CURRENT_TIMESTAMP
                   WHERE id = %s AND created_by = %s
                     AND status IN ('DRAFT', 'CHANGES_REQUESTED')
                   RETURNING status""",
                (event_id, owner_id),
            )
            row = await cursor.fetchone()
        if row is None:
            raise ValueError("Event is not editable by this owner")
        return str(row[0])

    async def review(
        self, connection: AsyncConnection, event_id: UUID, admin_id: UUID, decision: ReviewDecision
    ) -> str:
        """Apply a review decision and write an audit record atomically."""
        statuses = {
            "APPROVE": "APPROVED",
            "REJECT": "REJECTED",
            "REQUEST_CHANGE": "CHANGES_REQUESTED",
        }
        target = statuses[decision.action]
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """UPDATE events SET status = %s, review_feedback = %s, reviewed_by = %s,
                              reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                       WHERE id = %s AND status = 'PENDING_REVIEW'
                       RETURNING status""",
                    (target, decision.feedback, admin_id, event_id),
                )
                row = await cursor.fetchone()
                if row is None:
                    raise ValueError("Event is not pending review")
                await cursor.execute(
                    """INSERT INTO system_audit_logs
                       (admin_id, action, target_type, target_id, details)
                       VALUES (%s, %s, 'EVENT', %s, %s::jsonb)""",
                    (admin_id, decision.action, event_id, '{"source":"admin_review"}'),
                )
        return str(row[0])

    async def update_draft(
        self, connection: AsyncConnection, event_id: UUID, owner_id: UUID, body: EventCreate
    ) -> EventResponse:
        """Update an owned draft or change-requested event in one transaction."""
        async with connection.cursor() as cursor:
            await cursor.execute(
                """UPDATE events SET title = %s, description = %s, category = %s,
                          event_type = %s, check_in_method = %s, start_time = %s, end_time = %s,
                          location_name = %s, gps_lat = %s, gps_lng = %s, capacity = %s,
                          points_reward = %s, updated_at = CURRENT_TIMESTAMP
                   WHERE id = %s AND created_by = %s AND status IN ('DRAFT', 'CHANGES_REQUESTED')
                   RETURNING id, title, description, category, event_type, status, start_time,
                             end_time, location_name, capacity, points_reward
                """,
                (
                    body.title,
                    body.description,
                    body.category,
                    body.event_type,
                    body.check_in_method,
                    body.start_time,
                    body.end_time,
                    body.location_name,
                    body.gps_lat,
                    body.gps_lng,
                    body.capacity,
                    body.points_reward,
                    event_id,
                    owner_id,
                ),
            )
            row = await cursor.fetchone()
        if row is None:
            raise ValueError("Event is not editable by this owner")
        return EventResponse(
            id=row[0],
            title=row[1],
            description=row[2],
            category=row[3],
            eventType=row[4],
            status=row[5],
            startTime=row[6],
            endTime=row[7],
            locationName=row[8],
            capacity=row[9],
            pointsReward=row[10],
        )

    async def list_events(
        self, connection: AsyncConnection, status_filter: str = "PUBLISHED"
    ) -> list[EventListItem]:
        """List non-deleted events with registration counts."""
        async with connection.cursor() as cursor:
            await cursor.execute(
                """SELECT e.id, e.title, e.category, e.event_type, e.status, e.start_time,
                          e.end_time, e.location_name, e.capacity, e.points_reward,
                          COUNT(t.id) FILTER (WHERE t.status = 'OFFICIAL')
                   FROM events e LEFT JOIN tickets t ON t.event_id = e.id
                   WHERE e.deleted_at IS NULL AND e.status = %s
                   GROUP BY e.id ORDER BY e.start_time ASC""",
                (status_filter,),
            )
            rows = await cursor.fetchall()
        return [
            EventListItem(
                id=row[0],
                title=row[1],
                category=row[2],
                eventType=row[3],
                status=row[4],
                startTime=row[5],
                endTime=row[6],
                locationName=row[7],
                capacity=row[8],
                pointsReward=row[9],
                registeredCount=int(row[10]),
            )
            for row in rows
        ]

    async def get_event(
        self, connection: AsyncConnection, event_id: UUID, public_only: bool = True
    ) -> EventResponse:
        """Load one event, hiding deleted or non-public events when requested."""
        condition = "AND e.status = 'PUBLISHED'" if public_only else ""
        async with connection.cursor() as cursor:
            await cursor.execute(
                f"""SELECT e.id, e.title, e.description, e.category, e.event_type,
                           e.status, e.start_time, e.end_time, e.location_name,
                           e.capacity, e.points_reward
                    FROM events e
                    WHERE e.id = %s AND e.deleted_at IS NULL {condition}""",
                (event_id,),
            )
            row = await cursor.fetchone()
        if row is None:
            raise ValueError("Event not found")
        return EventResponse(
            id=row[0],
            title=row[1],
            description=row[2],
            category=row[3],
            eventType=row[4],
            status=row[5],
            startTime=row[6],
            endTime=row[7],
            locationName=row[8],
            capacity=row[9],
            pointsReward=row[10],
        )

    async def list_owned_events(
        self, connection: AsyncConnection, owner_id: UUID, status_group: str | None
    ) -> list[EventListItem]:
        """List a MOD owner's events grouped by lifecycle status."""
        groups = {
            "active": ("PUBLISHED", "IN_PROGRESS"),
            "draft": ("DRAFT", "PENDING_REVIEW", "CHANGES_REQUESTED", "APPROVED", "REJECTED"),
            "completed": ("COMPLETED", "CANCELLED"),
        }
        statuses = groups.get(
            status_group or "", tuple(groups["active"] + groups["draft"] + groups["completed"])
        )
        placeholders = ",".join(["%s"] * len(statuses))
        async with connection.cursor() as cursor:
            await cursor.execute(
                f"""SELECT e.id, e.title, e.category, e.event_type, e.status,
                           e.start_time, e.end_time, e.location_name, e.capacity,
                           e.points_reward,
                           COUNT(t.id) FILTER (WHERE t.status = 'OFFICIAL')
                    FROM events e LEFT JOIN tickets t ON t.event_id = e.id
                    WHERE e.created_by = %s AND e.deleted_at IS NULL
                      AND e.status IN ({placeholders})
                    GROUP BY e.id ORDER BY e.start_time ASC""",
                (owner_id, *statuses),
            )
            rows = await cursor.fetchall()
        return [
            EventListItem(
                id=row[0],
                title=row[1],
                category=row[2],
                eventType=row[3],
                status=row[4],
                startTime=row[5],
                endTime=row[6],
                locationName=row[7],
                capacity=row[8],
                registeredCount=int(row[9]),
                pointsReward=row[10],
            )
            for row in rows
        ]

    async def list_pending_reviews(self, connection: AsyncConnection) -> list[EventListItem]:
        """List events awaiting administrative review."""
        async with connection.cursor() as cursor:
            await cursor.execute(
                """SELECT e.id, e.title, e.category, e.event_type, e.status,
                          e.start_time, e.end_time, e.location_name, e.capacity,
                          e.points_reward,
                          COUNT(t.id) FILTER (WHERE t.status = 'OFFICIAL')
                   FROM events e LEFT JOIN tickets t ON t.event_id = e.id
                   WHERE e.deleted_at IS NULL AND e.status = 'PENDING_REVIEW'
                   GROUP BY e.id ORDER BY e.created_at ASC"""
            )
            rows = await cursor.fetchall()
        return [
            EventListItem(
                id=row[0],
                title=row[1],
                category=row[2],
                eventType=row[3],
                status=row[4],
                startTime=row[5],
                endTime=row[6],
                locationName=row[7],
                capacity=row[8],
                registeredCount=int(row[9]),
                pointsReward=row[10],
            )
            for row in rows
        ]

    async def publish(self, connection: AsyncConnection, event_id: UUID, admin_id: UUID) -> str:
        """Publish an approved or pending event and write an audit record."""
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """UPDATE events SET status = 'PUBLISHED', updated_at = CURRENT_TIMESTAMP
                       WHERE id = %s AND status IN ('APPROVED', 'PENDING_REVIEW')
                       RETURNING status""",
                    (event_id,),
                )
                row = await cursor.fetchone()
                if row is None:
                    raise ValueError("Event cannot be published in its current state")
                await cursor.execute(
                    """INSERT INTO system_audit_logs
                       (admin_id, action, target_type, target_id, details)
                       VALUES (%s, 'PUBLISH_EVENT', 'EVENT', %s, '{"source":"publish"}'::jsonb)""",
                    (admin_id, event_id),
                )
        return str(row[0])

    async def cancel(self, connection: AsyncConnection, event_id: UUID, owner_id: UUID) -> str:
        """Cancel an owned event only when its start is more than 24 hours away."""
        async with connection.cursor() as cursor:
            await cursor.execute(
                """UPDATE events SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP
                   WHERE id = %s AND created_by = %s AND status IN ('PUBLISHED', 'APPROVED')
                     AND start_time > CURRENT_TIMESTAMP + INTERVAL '24 hours'
                   RETURNING status""",
                (event_id, owner_id),
            )
            row = await cursor.fetchone()
        if row is None:
            raise ValueError("Event cannot be cancelled within 24 hours or is not owned by MOD")
        return str(row[0])

    async def soft_delete(
        self, connection: AsyncConnection, event_id: UUID, admin_id: UUID
    ) -> None:
        """Soft-delete an event and retain its audit history."""
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """UPDATE events SET deleted_at = CURRENT_TIMESTAMP,
                              updated_at = CURRENT_TIMESTAMP
                       WHERE id = %s AND deleted_at IS NULL RETURNING id""",
                    (event_id,),
                )
                if await cursor.fetchone() is None:
                    raise ValueError("Event not found")
                await cursor.execute(
                    """INSERT INTO system_audit_logs
                       (admin_id, action, target_type, target_id, details)
                       VALUES (%s, 'DELETE_EVENT', 'EVENT', %s,
                               '{"source":"soft_delete"}'::jsonb)""",
                    (admin_id, event_id),
                )
