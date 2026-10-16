"""End-to-end interactive submission and ledger tests."""

from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest
from httpx import AsyncClient

from app.config.settings import get_settings
from app.database.pool import Database
from app.shared.security import create_access_token


def _headers(user_id: UUID, role: str) -> dict[str, str]:
    """Build a bearer header for a test account."""
    settings = get_settings()
    token = create_access_token(
        user_id,
        role,
        f"{user_id}@test.gdu.edu.vn",
        settings.jwt_secret,
        settings.jwt_issuer,
        settings.jwt_audience,
        60,
    )
    return {"Authorization": f"Bearer {token}"}


async def _interactive_event(database: Database, moderator_id: UUID) -> tuple[UUID, UUID]:
    """Create a published interactive event and one action."""
    event_id, action_id = uuid4(), uuid4()
    start = datetime.now(UTC) - timedelta(hours=1)
    async with database.connection() as connection:
        async with connection.transaction():
            await connection.execute(
                """INSERT INTO events
                   (id, title, description, category, event_type, check_in_method,
                    start_time, end_time, location_name, points_reward, status, created_by)
                   VALUES (%s, 'Interactive', 'Proof event', 'SOCIAL',
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
async def test_interactive_submission_verify_and_idempotent_ledger(
    client: AsyncClient, database: Database, seeded_users: dict[str, UUID]
) -> None:
    """Submit, list, approve and reject duplicate interactive proof."""
    event_id, action_id = await _interactive_event(database, seeded_users["MOD"])
    student_headers = _headers(seeded_users["STUDENT"], "STUDENT")
    mod_headers = _headers(seeded_users["MOD"], "MOD")
    payload = {
        "facebookProofUrl": "https://www.facebook.com/gdu/posts/123",
        "completedActionIds": [str(action_id)],
    }
    submitted = await client.post(
        f"/api/student/events/{event_id}/interactive-submissions",
        json=payload,
        headers=student_headers,
    )
    assert submitted.status_code == 201
    submission_id = UUID(submitted.json()["id"])
    duplicate = await client.post(
        f"/api/student/events/{event_id}/interactive-submissions",
        json=payload,
        headers=student_headers,
    )
    assert duplicate.status_code == 409

    listed = await client.get(
        f"/api/mod/events/{event_id}/interactive-submissions",
        headers=mod_headers,
    )
    assert listed.status_code == 200
    assert listed.json()["statistics"]["pending"] == 1

    verified = await client.patch(
        f"/api/mod/events/{event_id}/interactive-submissions/{submission_id}/verify",
        json={"status": "APPROVED", "pointsAwarded": 1},
        headers=mod_headers,
    )
    assert verified.status_code == 200
    second = await client.patch(
        f"/api/mod/events/{event_id}/interactive-submissions/{submission_id}/verify",
        json={"status": "APPROVED", "pointsAwarded": 1},
        headers=mod_headers,
    )
    assert second.status_code == 422
    async with database.connection() as connection:
        cursor = await connection.execute(
            "SELECT COUNT(*) FROM training_points_ledger WHERE source_type = "
            "'INTERACTIVE_SUBMISSION' AND source_id = %s",
            (submission_id,),
        )
        count = await cursor.fetchone()
    assert count == (1,)
