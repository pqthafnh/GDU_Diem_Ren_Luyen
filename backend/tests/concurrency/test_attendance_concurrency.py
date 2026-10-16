"""PostgreSQL concurrency coverage for idempotent QR attendance."""

import asyncio
from uuid import UUID

import pytest
from httpx import AsyncClient

from app.config.settings import get_settings
from app.database.pool import Database
from app.shared.security import create_access_token


def _token(user_id: UUID, role: str) -> dict[str, str]:
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


@pytest.mark.asyncio
async def test_concurrent_checkins_create_one_attendance_and_ledger(
    client: AsyncClient,
    database: Database,
    standard_event: UUID,
    seeded_users: dict[str, UUID],
) -> None:
    """Concurrent retries for one student remain idempotent."""
    mod_headers = _token(seeded_users["MOD"], "MOD")
    student_headers = _token(seeded_users["STUDENT"], "STUDENT")
    registered = await client.post(
        f"/api/student/events/{standard_event}/register",
        json={"phoneNumber": "0901234567", "confirmCorrect": True},
        headers=student_headers,
    )
    assert registered.status_code == 201
    qr = await client.get(f"/api/events/{standard_event}/qr-token", headers=mod_headers)
    assert qr.status_code == 200
    payload = {"qrToken": qr.json()["token"], "lat": 10.8, "lng": 106.6}

    async def check_in() -> int:
        response = await client.post(
            "/api/attendance/check-in", json=payload, headers=student_headers
        )
        return response.status_code

    statuses = await asyncio.gather(*(check_in() for _ in range(20)))
    assert all(status == 200 for status in statuses)
    async with database.connection() as connection:
        cursor = await connection.execute(
            "SELECT COUNT(*) FROM attendance WHERE event_id = %s AND student_id = %s",
            (standard_event, seeded_users["STUDENT"]),
        )
        attendance_count = await cursor.fetchone()
        cursor = await connection.execute(
            "SELECT COUNT(*) FROM training_points_ledger WHERE event_id = %s AND student_id = %s",
            (standard_event, seeded_users["STUDENT"]),
        )
        ledger_count = await cursor.fetchone()
    assert attendance_count == (1,)
    assert ledger_count == (1,)
