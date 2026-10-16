"""Attendance transaction and points ledger integration."""

from datetime import UTC, datetime
from uuid import UUID

from jwt import InvalidTokenError
from psycopg import AsyncConnection, AsyncCursor
from psycopg.types.json import Json

from app.config.settings import Settings
from app.modules.attendance.schemas import (
    CallStatusRequest,
    CheckInRequest,
    CheckInResponse,
    ManualCheckInRequest,
    ManualCheckOutRequest,
    VerifiedCheckOutRequest,
)
from app.shared.geo import haversine_meters
from app.shared.security import decode_access_token


class AttendanceService:
    """Validates QR/GPS check-ins against server-owned event coordinates."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def check_in(
        self, connection: AsyncConnection, student_id: UUID, body: CheckInRequest
    ) -> CheckInResponse:
        """Check in once and award points idempotently in one transaction."""
        try:
            claims = decode_access_token(
                body.qr_token,
                self.settings.jwt_qr_secret,
                self.settings.jwt_issuer,
                self.settings.jwt_audience,
            )
        except InvalidTokenError as error:
            raise ValueError("QR token is invalid or expired") from error
        if claims.get("typ") != "eventQr":
            raise ValueError("QR token is invalid or expired")
        event_id = UUID(str(claims["eventId"]))
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """SELECT gps_lat, gps_lng, gps_radius_meters, points_reward, category,
                              start_time, end_time
                       FROM events WHERE id = %s AND status = 'PUBLISHED' FOR SHARE""",
                    (event_id,),
                )
                event = await cursor.fetchone()
                if event is None or event[0] is None or event[1] is None:
                    raise ValueError("Event is not available for QR attendance")
                now = datetime.now(UTC)
                if now < event[5] or now > event[6]:
                    raise ValueError("Event is outside attendance window")
                distance = haversine_meters(float(event[0]), float(event[1]), body.lat, body.lng)
                if distance > float(event[2] or 100):
                    raise ValueError("GPS location is outside the event radius")
                await cursor.execute(
                    """SELECT id FROM tickets WHERE event_id = %s AND student_id = %s
                       AND status = 'OFFICIAL'""",
                    (event_id, student_id),
                )
                ticket = await cursor.fetchone()
                if ticket is None:
                    raise ValueError("An official ticket is required")
                await cursor.execute(
                    """INSERT INTO attendance
                       (event_id, student_id, ticket_id, scanned_lat, scanned_lng,
                        distance_meters, status)
                       VALUES (%s, %s, %s, %s, %s, %s, 'CHECKED_IN')
                       ON CONFLICT (event_id, student_id) DO NOTHING
                       RETURNING id""",
                    (event_id, student_id, ticket[0], body.lat, body.lng, distance),
                )
                attendance = await cursor.fetchone()
                if attendance is not None and event[3] > 0:
                    await cursor.execute(
                        """INSERT INTO training_points_ledger
                           (student_id, event_id, points_awarded, criteria_category,
                            semester, academic_year, note, source_type, source_id,
                            idempotency_key, metadata)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, 'ATTENDANCE', %s,
                                   %s, %s)
                           ON CONFLICT (idempotency_key)
                           DO NOTHING""",
                        (
                            student_id,
                            event_id,
                            event[3],
                            event[4],
                            "HK1" if now.month <= 6 else "HK2",
                            f"{now.year}-{now.year + 1}",
                            "QR/GPS attendance",
                            attendance[0],
                            f"ATTENDANCE:{attendance[0]}:{student_id}",
                            Json({"attendanceId": str(attendance[0])}),
                        ),
                    )
        return CheckInResponse(success=True, status="CHECKED_IN", distanceMeters=distance)

    async def manual_check_in(
        self,
        connection: AsyncConnection,
        event_id: UUID,
        moderator_id: UUID,
        body: ManualCheckInRequest,
    ) -> int:
        """Record an idempotent MOD check-in for official event ticket holders."""
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await self._assert_event_owner(cursor, event_id, moderator_id)
                count = 0
                for student_id in body.student_ids:
                    await cursor.execute(
                        """SELECT id FROM tickets
                           WHERE event_id = %s AND student_id = %s AND status = 'OFFICIAL'""",
                        (event_id, student_id),
                    )
                    ticket = await cursor.fetchone()
                    if ticket is None:
                        continue
                    await cursor.execute(
                        """INSERT INTO attendance
                           (event_id, student_id, ticket_id, status, verified_by, note)
                           VALUES (%s, %s, %s, 'CHECKED_IN', %s, %s)
                           ON CONFLICT (event_id, student_id) DO UPDATE
                           SET status = CASE WHEN attendance.status = 'CHECKED_OUT'
                                             THEN attendance.status ELSE 'CHECKED_IN' END,
                               verified_by = EXCLUDED.verified_by,
                               note = COALESCE(EXCLUDED.note, attendance.note)
                           RETURNING id, (xmax = 0) AS inserted""",
                        (event_id, student_id, ticket[0], moderator_id, body.note),
                    )
                    result = await cursor.fetchone()
                    if result is not None and result[1]:
                        count += 1
                if count:
                    await cursor.execute(
                        """INSERT INTO system_audit_logs
                           (admin_id, action, target_type, target_id, details)
                           VALUES (%s, 'MANUAL_CHECK_IN', 'EVENT', %s, %s::jsonb)""",
                        (moderator_id, event_id, Json({"count": count})),
                    )
        return count

    async def manual_check_out(
        self,
        connection: AsyncConnection,
        event_id: UUID,
        moderator_id: UUID,
        body: ManualCheckOutRequest,
    ) -> dict[str, object]:
        """Check out selected students, mark missing attendees, and award points."""
        async with connection.transaction():
            async with connection.cursor() as cursor:
                points = await self._event_points(cursor, event_id, moderator_id)
                await cursor.execute(
                    """SELECT student_id FROM attendance
                       WHERE event_id = %s AND status IN ('CHECKED_IN', 'MANUAL_OVERRIDE')
                       FOR UPDATE""",
                    (event_id,),
                )
                checked_in = {row[0] for row in await cursor.fetchall()}
                selected = set(body.checked_out_student_ids)
                completed = checked_in & selected
                missing = checked_in - selected
                for student_id in completed:
                    await cursor.execute(
                        """UPDATE attendance
                           SET status = 'CHECKED_OUT', check_out_time = CURRENT_TIMESTAMP,
                               note = COALESCE(%s, note),
                               verified_by = %s
                           WHERE event_id = %s AND student_id = %s
                           RETURNING id""",
                        (body.note, moderator_id, event_id, student_id),
                    )
                    attendance = await cursor.fetchone()
                    if attendance is None:
                        raise RuntimeError("Attendance update returned no row")
                    await self._award_points(
                        cursor,
                        attendance[0],
                        student_id,
                        event_id,
                        points,
                        "EXTRACURRICULAR_CHECKOUT",
                        "Extracurricular checkout",
                        moderator_id,
                    )
                for student_id in missing:
                    await cursor.execute(
                        """UPDATE attendance SET status = 'MISSING_CHECKOUT',
                               call_status = 'PENDING_CALL'
                           WHERE event_id = %s AND student_id = %s""",
                        (event_id, student_id),
                    )
                if completed or missing:
                    await cursor.execute(
                        """INSERT INTO system_audit_logs
                        (admin_id, action, target_type, target_id, details)
                        VALUES (%s, 'MANUAL_CHECK_OUT', 'EVENT', %s, %s::jsonb)""",
                        (
                            moderator_id,
                            event_id,
                            Json(
                                {
                                    "checkedOutCount": len(completed),
                                    "missingCount": len(missing),
                                }
                            ),
                        ),
                    )
                await cursor.execute(
                    """SELECT a.student_id, u.student_id, u.full_name, u.major, u.class_name,
                              COALESCE(t.contact_phone, u.phone_number), a.check_in_time,
                              a.call_status
                       FROM attendance a
                       JOIN users u ON u.id = a.student_id
                       LEFT JOIN tickets t ON t.id = a.ticket_id
                       WHERE a.event_id = %s AND a.status = 'MISSING_CHECKOUT'""",
                    (event_id,),
                )
                rows = await cursor.fetchall()
        return {
            "success": True,
            "hasMissingStudents": bool(missing),
            "checkedOutCount": len(completed),
            "pointsAwardedEach": points,
            "missingStudents": [
                {
                    "id": row[0],
                    "studentId": row[1],
                    "fullName": row[2],
                    "major": row[3],
                    "className": row[4],
                    "phoneNumber": row[5],
                    "checkInTime": row[6],
                    "callStatus": row[7],
                }
                for row in rows
            ],
        }

    async def update_call_status(
        self,
        connection: AsyncConnection,
        event_id: UUID,
        moderator_id: UUID,
        body: CallStatusRequest,
    ) -> None:
        """Persist a MOD call outcome for a missing checkout."""
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await self._assert_event_owner(cursor, event_id, moderator_id)
                await cursor.execute(
                    """UPDATE attendance SET call_status = %s, call_note = %s
                       WHERE event_id = %s AND student_id = %s
                         AND status = 'MISSING_CHECKOUT'""",
                    (body.call_status, body.call_note, event_id, body.student_id),
                )
                if cursor.rowcount != 1:
                    raise ValueError("Missing checkout record not found")
                await cursor.execute(
                    """INSERT INTO system_audit_logs
                       (admin_id, action, target_type, target_id, details)
                       VALUES (%s, 'UPDATE_CALL_STATUS', 'ATTENDANCE', %s, %s::jsonb)""",
                    (
                        moderator_id,
                        body.student_id,
                        Json({"eventId": str(event_id), "callStatus": body.call_status}),
                    ),
                )

    async def verify_check_out(
        self,
        connection: AsyncConnection,
        event_id: UUID,
        moderator_id: UUID,
        body: VerifiedCheckOutRequest,
    ) -> int:
        """Complete follow-up checkouts and award points idempotently."""
        async with connection.transaction():
            async with connection.cursor() as cursor:
                points = await self._event_points(cursor, event_id, moderator_id)
                count = 0
                for student_id in body.verified_student_ids:
                    await cursor.execute(
                        """UPDATE attendance
                           SET status = 'CHECKED_OUT', call_status = 'VERIFIED',
                               verified_by_call_at = CURRENT_TIMESTAMP,
                               check_out_time = CURRENT_TIMESTAMP, verified_by = %s
                           WHERE event_id = %s AND student_id = %s
                             AND status = 'MISSING_CHECKOUT'""",
                        (moderator_id, event_id, student_id),
                    )
                    if cursor.rowcount:
                        await cursor.execute(
                            "SELECT id FROM attendance WHERE event_id = %s AND student_id = %s",
                            (event_id, student_id),
                        )
                        attendance = await cursor.fetchone()
                        if attendance is None:
                            raise RuntimeError("Attendance record not found")
                        await self._award_points(
                            cursor,
                            attendance[0],
                            student_id,
                            event_id,
                            points,
                            "EXTRACURRICULAR_CHECKOUT",
                            "Verified extracurricular checkout",
                            moderator_id,
                        )
                        count += 1
                if count:
                    await cursor.execute(
                        """INSERT INTO system_audit_logs
                           (admin_id, action, target_type, target_id, details)
                           VALUES (%s, 'VERIFY_CHECK_OUT', 'EVENT', %s, %s::jsonb)""",
                        (moderator_id, event_id, Json({"count": count})),
                    )
        return count

    async def _assert_event_owner(
        self, cursor: AsyncCursor[tuple[object, ...]], event_id: UUID, moderator_id: UUID
    ) -> None:
        await cursor.execute(
            "SELECT id FROM events WHERE id = %s AND created_by = %s FOR UPDATE",
            (event_id, moderator_id),
        )
        if await cursor.fetchone() is None:
            raise ValueError("MOD does not own this event")

    async def _event_points(
        self, cursor: AsyncCursor[tuple[object, ...]], event_id: UUID, moderator_id: UUID
    ) -> int:
        await self._assert_event_owner(cursor, event_id, moderator_id)
        await cursor.execute("SELECT points_reward FROM events WHERE id = %s", (event_id,))
        row = await cursor.fetchone()
        if row is None:
            raise ValueError("Event not found")
        points = row[0]
        if not isinstance(points, int):
            raise ValueError("Event points are invalid")
        return points

    async def _award_points(
        self,
        cursor: AsyncCursor[tuple[object, ...]],
        attendance_id: UUID,
        student_id: UUID,
        event_id: UUID,
        points: int,
        source_type: str,
        note: str,
        awarded_by: UUID,
    ) -> None:
        await cursor.execute(
            """INSERT INTO training_points_ledger
               (student_id, event_id, points_awarded, criteria_category, semester,
                academic_year, note, source_type, source_id, idempotency_key,
                awarded_by, metadata)
               VALUES (%s, %s, %s, 'Extracurricular', 'ALL', 'CUMULATIVE', %s,
                       %s, %s, %s, %s, %s)
               ON CONFLICT (idempotency_key)
               DO NOTHING""",
            (
                student_id,
                event_id,
                points,
                note,
                source_type,
                attendance_id,
                f"{source_type}:{attendance_id}:{student_id}",
                awarded_by,
                Json({"attendanceId": str(attendance_id)}),
            ),
        )
