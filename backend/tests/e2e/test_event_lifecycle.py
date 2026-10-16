"""End-to-end event lifecycle and ownership tests."""

from datetime import UTC, datetime, timedelta
from uuid import UUID

import pytest
from httpx import AsyncClient

from app.database.pool import Database
from app.shared.security import hash_password


async def _login(client: AsyncClient, email: str, password: str) -> str:
    """Login a seeded account and return its access token."""
    response = await client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return str(response.json()["accessToken"])


async def _create_staff(database: Database) -> None:
    """Create deterministic staff accounts for this isolated test database."""
    async with database.connection() as connection:
        async with connection.transaction():
            for role, email in (("MOD", "mod@gdu.edu.vn"), ("ADMIN", "admin@gdu.edu.vn")):
                await connection.execute(
                    """INSERT INTO users
                       (last_name, first_name, full_name, birth_date, email,
                        password_hash, is_password_changed, role)
                       VALUES ('GDU', %s, %s, '1990-01-01', %s, %s, TRUE, %s)
                       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash,
                         is_password_changed = TRUE, role = EXCLUDED.role""",
                    (role, f"GDU {role}", email, hash_password(f"{role.title()}@123"), role),
                )


def _event_payload(title: str = "Lifecycle event") -> dict[str, object]:
    """Build a valid standard event payload."""
    start = datetime.now(UTC) + timedelta(days=3)
    return {
        "title": title,
        "description": "Lifecycle verification",
        "category": "ACADEMIC",
        "eventType": "STANDARD",
        "checkInMethod": "QR_GPS",
        "startTime": start.isoformat(),
        "endTime": (start + timedelta(hours=2)).isoformat(),
        "locationName": "GDU",
        "gpsLat": 10.8,
        "gpsLng": 106.6,
        "capacity": 5,
        "pointsReward": 10,
    }


async def _status(database: Database, event_id: UUID) -> str:
    """Read an event status directly from PostgreSQL."""
    async with database.connection() as connection:
        cursor = await connection.execute("SELECT status FROM events WHERE id = %s", (event_id,))
        row = await cursor.fetchone()
    assert row is not None
    return str(row[0])


@pytest.mark.asyncio
async def test_event_review_publish_public_listing_and_soft_delete(
    client: AsyncClient, database: Database
) -> None:
    """Exercise draft, change request, approval, publish and soft deletion."""
    await _create_staff(database)
    mod_token = await _login(client, "mod@gdu.edu.vn", "Mod@123")
    admin_token = await _login(client, "admin@gdu.edu.vn", "Admin@123")
    headers = {"Authorization": f"Bearer {mod_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    created = await client.post("/api/mod/events", json=_event_payload(), headers=headers)
    assert created.status_code == 201
    event_id = UUID(created.json()["id"])
    assert await _status(database, event_id) == "DRAFT"

    updated = await client.put(
        f"/api/mod/events/{event_id}", json=_event_payload("Updated"), headers=headers
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Updated"

    submitted = await client.post(f"/api/mod/events/{event_id}/submit", headers=headers)
    assert submitted.status_code == 200
    assert await _status(database, event_id) == "PENDING_REVIEW"

    requested = await client.post(
        f"/api/admin/reviews/{event_id}/decision",
        json={"action": "REQUEST_CHANGE", "feedback": "Add details"},
        headers=admin_headers,
    )
    assert requested.status_code == 200
    assert await _status(database, event_id) == "CHANGES_REQUESTED"

    changed = await client.put(
        f"/api/mod/events/{event_id}", json=_event_payload("Changed again"), headers=headers
    )
    assert changed.status_code == 200
    await client.post(f"/api/mod/events/{event_id}/submit", headers=headers)
    approved = await client.post(
        f"/api/admin/reviews/{event_id}/decision",
        json={"action": "APPROVE"},
        headers=admin_headers,
    )
    assert approved.status_code == 200
    assert await _status(database, event_id) == "APPROVED"

    published = await client.post(f"/api/admin/events/{event_id}/publish", headers=admin_headers)
    assert published.status_code == 200
    assert await _status(database, event_id) == "PUBLISHED"
    public = await client.get("/api/student/events")
    assert public.status_code == 200
    assert any(item["id"] == str(event_id) for item in public.json())

    forbidden_update = await client.put(
        f"/api/mod/events/{event_id}", json=_event_payload("Illegal"), headers=admin_headers
    )
    assert forbidden_update.status_code == 403
    cancelled = await client.post(f"/api/mod/events/{event_id}/cancel", headers=headers)
    assert cancelled.status_code == 200
    assert await _status(database, event_id) == "CANCELLED"

    deleted = await client.delete(f"/api/admin/events/{event_id}", headers=admin_headers)
    assert deleted.status_code == 200
    assert await _status(database, event_id) == "CANCELLED"
    assert not any(
        item["id"] == str(event_id) for item in (await client.get("/api/student/events")).json()
    )
