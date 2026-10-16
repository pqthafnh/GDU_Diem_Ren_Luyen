"""End-to-end coverage for manual and extracurricular attendance workflows."""

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


@pytest.mark.asyncio
async def test_manual_and_extracurricular_attendance_workflows(
    client: AsyncClient, database: Database, seeded_users: dict[str, UUID]
) -> None:
    """Verify ownership, missing checkout, call status, audit, and ledger idempotency."""
    event_id, second_student = uuid4(), uuid4()
    async with database.connection() as connection:
        async with connection.transaction():
            await connection.execute(
                """INSERT INTO users
                   (id, student_id, last_name, first_name, full_name, birth_date, class_name,
                    major, phone_number, email, password_hash, is_password_changed, role)
                   VALUES (%s, 'S002', 'Test', 'Two', 'Test Two', '2000-01-01', 'C2',
                           'IT', '0900000002', %s, 'hash', TRUE, 'STUDENT')""",
                (second_student, f"second-{uuid4()}@test.gdu.edu.vn"),
            )
            await connection.execute(
                """INSERT INTO events
                   (id, title, description, category, event_type, check_in_method,
                    start_time, end_time, location_name, capacity, points_reward, status,
                    created_by)
                   VALUES (%s, 'Manual event', 'Attendance', 'SOCIAL', 'STANDARD',
                           'MANUAL_ROLLCALL', %s, %s, 'GDU', 2, 5, 'PUBLISHED', %s)""",
                (
                    event_id,
                    datetime.now(UTC) - timedelta(hours=1),
                    datetime.now(UTC) + timedelta(hours=1),
                    seeded_users["MOD"],
                ),
            )
            for student_id, number in (
                (seeded_users["STUDENT"], "S001"),
                (second_student, "S002"),
            ):
                await connection.execute(
                    """INSERT INTO tickets
                       (event_id, student_id, status, queue_number, seat_number)
                       VALUES (%s, %s, 'OFFICIAL', %s, %s)""",
                    (event_id, student_id, number == "S001" and 1 or 2, f"A-{number}"),
                )

    mod_headers = _headers(seeded_users["MOD"], "MOD")
    other_mod = uuid4()
    async with database.connection() as connection:
        await connection.execute(
            """INSERT INTO users
               (id, student_id, last_name, first_name, full_name, birth_date, email,
                password_hash, is_password_changed, role)
               VALUES (%s, 'M002', 'Other', 'Mod', 'Other Mod', '2000-01-01', %s,
                       'hash', TRUE, 'MOD')""",
            (other_mod, f"other-mod-{uuid4()}@test.gdu.edu.vn"),
        )

    checked = await client.post(
        f"/api/mod/events/{event_id}/attendance/check-in",
        json={
            "studentIds": [str(seeded_users["STUDENT"]), str(second_student)],
            "note": "Roll call note",
        },
        headers=mod_headers,
    )
    assert checked.status_code == 200
    assert checked.json()["checkedInCount"] == 2

    async with database.connection() as connection:
        cursor = await connection.execute(
            "SELECT note, verified_by, status FROM attendance WHERE event_id = %s "
            "AND student_id = %s",
            (event_id, seeded_users["STUDENT"]),
        )
        assert await cursor.fetchone() == (
            "Roll call note",
            seeded_users["MOD"],
            "CHECKED_IN",
        )

    other_result = await client.post(
        f"/api/mod/events/{event_id}/attendance/check-in",
        json={"studentIds": [str(seeded_users["STUDENT"])]},
        headers=_headers(other_mod, "MOD"),
    )
    assert other_result.status_code == 422

    admin_result = await client.post(
        f"/api/mod/events/{event_id}/attendance/check-in",
        json={"studentIds": [str(seeded_users["STUDENT"])]},
        headers=_headers(seeded_users["ADMIN"], "ADMIN"),
    )
    assert admin_result.status_code == 403

    checkout = await client.post(
        f"/api/mod/events/{event_id}/attendance/check-out",
        json={
            "checkedOutStudentIds": [str(seeded_users["STUDENT"])],
            "note": "Checked out",
        },
        headers=mod_headers,
    )
    assert checkout.status_code == 200
    missing = checkout.json()["missingStudents"]
    assert len(missing) == 1
    assert {
        "studentId",
        "fullName",
        "className",
        "major",
        "phoneNumber",
        "callStatus",
    } <= missing[0].keys()
    assert missing[0]["studentId"] == "S002"

    status = await client.patch(
        f"/api/mod/events/{event_id}/attendance/call-status",
        json={
            "studentId": str(second_student),
            "callStatus": "ANSWERED",
            "callNote": "Confirmed",
        },
        headers=mod_headers,
    )
    assert status.status_code == 200

    verified = await client.post(
        f"/api/mod/events/{event_id}/attendance/check-out-verified",
        json={"verifiedStudentIds": [str(second_student)]},
        headers=mod_headers,
    )
    assert verified.status_code == 200
    assert verified.json()["completedCount"] == 1
    repeated = await client.post(
        f"/api/mod/events/{event_id}/attendance/check-out-verified",
        json={"verifiedStudentIds": [str(second_student)]},
        headers=mod_headers,
    )
    assert repeated.status_code == 200
    assert repeated.json()["completedCount"] == 0

    async with database.connection() as connection:
        cursor = await connection.execute(
            "SELECT status, call_status, verified_by FROM attendance WHERE event_id = %s "
            "AND student_id = %s",
            (event_id, second_student),
        )
        assert await cursor.fetchone() == ("CHECKED_OUT", "VERIFIED", seeded_users["MOD"])
        cursor = await connection.execute(
            """SELECT COUNT(*) FROM training_points_ledger
               WHERE event_id = %s AND source_type = 'EXTRACURRICULAR_CHECKOUT'""",
            (event_id,),
        )
        assert await cursor.fetchone() == (2,)
        cursor = await connection.execute(
            """SELECT action, COUNT(*) FROM system_audit_logs
               WHERE target_id = %s GROUP BY action ORDER BY action""",
            (event_id,),
        )
        assert dict(await cursor.fetchall()) == {
            "MANUAL_CHECK_IN": 1,
            "MANUAL_CHECK_OUT": 1,
            "VERIFY_CHECK_OUT": 1,
        }
