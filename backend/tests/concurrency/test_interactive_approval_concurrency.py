"""PostgreSQL concurrency coverage for interactive approval idempotency."""

import asyncio
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest

from app.database.pool import Database
from app.modules.interactive_submissions.schemas import VerifySubmissionRequest
from app.modules.interactive_submissions.service import InteractiveSubmissionService


async def _interactive_event(database: Database, moderator_id: UUID) -> tuple[UUID, UUID]:
    """Create a published interactive event and one action for the race test."""
    event_id, action_id = uuid4(), uuid4()
    start = datetime.now(UTC) - timedelta(hours=1)
    async with database.connection() as connection:
        async with connection.transaction():
            await connection.execute(
                """INSERT INTO events
                   (id, title, description, category, event_type, check_in_method,
                    start_time, end_time, location_name, points_reward, status, created_by)
                   VALUES (%s, 'Interactive race', 'Proof event', 'SOCIAL',
                           'INTERACTIVE', 'SOCIAL_INTERACTIVE', %s, %s, 'Online',
                           3, 'PUBLISHED', %s)""",
                (event_id, start, start + timedelta(hours=2), moderator_id),
            )
            await connection.execute(
                """INSERT INTO interactive_actions
                   (id, event_id, action_type, label, description, points_reward, order_index)
                   VALUES (%s, %s, 'LIKE', 'Like', 'Like the post', 1, 1)""",
                (action_id, event_id),
            )
    return event_id, action_id


@pytest.mark.asyncio
async def test_concurrent_interactive_approvals_finalize_once(
    database: Database, seeded_users: dict[str, UUID]
) -> None:
    """Concurrent approval retries leave one final state and one ledger row."""
    event_id, action_id = await _interactive_event(database, seeded_users["MOD"])
    submission_id = uuid4()
    async with database.connection() as connection:
        await connection.execute(
            """INSERT INTO interactive_submissions
               (id, event_id, student_id, facebook_proof_url, submitted_actions)
               VALUES (%s, %s, %s, %s, %s::jsonb)""",
            (
                submission_id,
                event_id,
                seeded_users["STUDENT"],
                "https://www.facebook.com/gdu/posts/concurrent",
                f'["{action_id}"]',
            ),
        )

    async def approve() -> str:
        async with database.connection() as connection:
            return await InteractiveSubmissionService().verify(
                connection,
                event_id,
                submission_id,
                seeded_users["MOD"],
                VerifySubmissionRequest(status="APPROVED", points_awarded=1),
            )

    results = await asyncio.gather(*(approve() for _ in range(10)), return_exceptions=True)
    assert sum(result == "APPROVED" for result in results) == 1
    assert sum(isinstance(result, ValueError) for result in results) == 9
    async with database.connection() as connection:
        cursor = await connection.execute(
            """SELECT status, COUNT(*)
               FROM interactive_submissions WHERE id = %s GROUP BY status""",
            (submission_id,),
        )
        assert await cursor.fetchone() == ("APPROVED", 1)
        cursor = await connection.execute(
            """SELECT COUNT(*) FROM training_points_ledger
               WHERE source_type = 'INTERACTIVE_SUBMISSION' AND source_id = %s""",
            (submission_id,),
        )
        assert await cursor.fetchone() == (1,)
