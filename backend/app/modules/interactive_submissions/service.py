"""Interactive proof submission and verification workflows."""

from urllib.parse import urlparse
from uuid import UUID, uuid4

from psycopg import AsyncConnection
from psycopg.types.json import Json

from app.modules.interactive_submissions.schemas import (
    SubmissionItem,
    SubmissionRequest,
    SubmissionResponse,
    SubmissionStatistics,
    VerifySubmissionRequest,
)


def is_facebook_url(value: str) -> bool:
    """Return whether a URL uses an approved Facebook proof host."""
    parsed = urlparse(value)
    host = (parsed.hostname or "").lower()
    return parsed.scheme == "https" and (
        host == "facebook.com" or host.endswith(".facebook.com") or host in {"fb.com", "fb.watch"}
    )


class InteractiveSubmissionService:
    """Coordinates submission validation and idempotent ledger awards."""

    async def submit(
        self, connection: AsyncConnection, event_id: UUID, student_id: UUID, body: SubmissionRequest
    ) -> SubmissionResponse:
        """Store one pending proof after validating event and action ownership."""
        url = str(body.facebook_proof_url)
        if not is_facebook_url(url):
            raise ValueError("A valid Facebook proof URL is required")
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """SELECT event_type, status FROM events WHERE id = %s FOR UPDATE""",
                    (event_id,),
                )
                event = await cursor.fetchone()
                if event is None or event[0] != "INTERACTIVE" or event[1] != "PUBLISHED":
                    raise ValueError("Event is not an available interactive event")
                await cursor.execute(
                    """SELECT id FROM interactive_submissions
                       WHERE event_id = %s AND student_id = %s""",
                    (event_id, student_id),
                )
                if await cursor.fetchone() is not None:
                    raise RuntimeError("Student already submitted proof")
                placeholders = ",".join(["%s"] * len(body.completed_action_ids))
                await cursor.execute(
                    f"""SELECT id::text FROM interactive_actions
                        WHERE event_id = %s AND id::text IN ({placeholders})""",
                    (event_id, *body.completed_action_ids),
                )
                valid_actions = await cursor.fetchall()
                if len(valid_actions) != len(set(body.completed_action_ids)):
                    raise ValueError("One or more actions do not belong to the event")
                if len(body.completed_action_ids) != len(set(body.completed_action_ids)):
                    raise ValueError("Completed actions must be unique")
                submission_id = uuid4()
                await cursor.execute(
                    """INSERT INTO interactive_submissions
                       (id, event_id, student_id, facebook_proof_url, submitted_actions)
                       VALUES (%s, %s, %s, %s, %s)
                       RETURNING id, event_id, status, facebook_proof_url,
                                 jsonb_array_length(submitted_actions),
                                 points_awarded, created_at
                    """,
                    (
                        submission_id,
                        event_id,
                        student_id,
                        url,
                        Json([str(value) for value in body.completed_action_ids]),
                    ),
                )
                row = await cursor.fetchone()
        if row is None:
            raise RuntimeError("Submission insert returned no row")
        return SubmissionResponse(
            id=row[0],
            eventId=row[1],
            status=row[2],
            facebookProofUrl=row[3],
            completedActionsCount=row[4],
            pointsAwarded=row[5],
            submittedAt=row[6],
        )

    async def verify(
        self,
        connection: AsyncConnection,
        event_id: UUID,
        submission_id: UUID,
        moderator_id: UUID,
        body: VerifySubmissionRequest,
    ) -> str:
        """Verify a submission and award points once using the ledger unique key."""
        if body.status not in {"APPROVED", "REJECTED"}:
            raise ValueError("Status must be APPROVED or REJECTED")
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """SELECT s.student_id, s.status, s.event_id, e.created_by, e.category,
                              jsonb_array_length(s.submitted_actions)
                       FROM interactive_submissions s
                       JOIN events e ON e.id = s.event_id
                       WHERE s.id = %s AND s.event_id = %s FOR UPDATE""",
                    (submission_id, event_id),
                )
                row = await cursor.fetchone()
                if row is None or row[3] != moderator_id:
                    raise ValueError("Submission is not owned by this MOD")
                points = body.points_awarded if body.status == "APPROVED" else 0
                if body.status == "APPROVED" and points < 1:
                    raise ValueError("Approved submissions must award at least one point")
                if body.status == "APPROVED" and points > min(int(row[5]), 3):
                    raise ValueError("Awarded points exceed completed actions")
                if row[1] in {"APPROVED", "REJECTED"}:
                    raise ValueError("Submission has already been finalized")
                await cursor.execute(
                    """UPDATE interactive_submissions
                       SET status = %s, points_awarded = %s, verified_by = %s,
                           verified_at = CURRENT_TIMESTAMP, note = %s
                       WHERE id = %s""",
                    (body.status, points, moderator_id, body.note, submission_id),
                )
                if body.status == "APPROVED" and row[1] != "APPROVED":
                    await cursor.execute(
                        """INSERT INTO training_points_ledger
                           (student_id, event_id, points_awarded, criteria_category,
                            semester, academic_year, note, source_type, source_id,
                            idempotency_key, awarded_by, metadata)
                           VALUES (%s, %s, %s, 'Tương tác', 'ALL', 'CUMULATIVE', %s,
                                   'INTERACTIVE_SUBMISSION', %s,
                                   %s::text || ':interactive', %s, %s)
                           ON CONFLICT (idempotency_key) DO NOTHING""",
                        (
                            row[0],
                            event_id,
                            points,
                            body.note or "Interactive proof approved",
                            submission_id,
                            submission_id,
                            moderator_id,
                            Json({"submissionId": str(submission_id)}),
                        ),
                    )
        return body.status

    async def list_for_mod(
        self,
        connection: AsyncConnection,
        event_id: UUID,
        moderator_id: UUID,
        status: str | None,
        page: int,
        limit: int,
    ) -> tuple[list[SubmissionItem], SubmissionStatistics]:
        """Return owned-event submissions with pagination and aggregate counts."""
        offset = (page - 1) * limit
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT id FROM events WHERE id = %s AND created_by = %s "
                "AND event_type = 'INTERACTIVE'",
                (event_id, moderator_id),
            )
            if await cursor.fetchone() is None:
                raise ValueError("MOD does not own this interactive event")
            await cursor.execute(
                """SELECT s.id, s.event_id, s.status, s.facebook_proof_url,
                          jsonb_array_length(s.submitted_actions), s.points_awarded,
                          s.created_at, s.student_id, u.full_name,
                          ARRAY(SELECT jsonb_array_elements_text(s.submitted_actions)),
                          s.note
                   FROM interactive_submissions s JOIN users u ON u.id = s.student_id
                   WHERE s.event_id = %s AND (%s::text IS NULL OR s.status = %s)
                   ORDER BY s.created_at DESC LIMIT %s OFFSET %s""",
                (event_id, status, status, limit, offset),
            )
            rows = await cursor.fetchall()
            await cursor.execute(
                """SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'PENDING'),
                          COUNT(*) FILTER (WHERE status = 'APPROVED'),
                          COUNT(*) FILTER (WHERE status = 'REJECTED'),
                          COALESCE(SUM(points_awarded), 0)
                   FROM interactive_submissions WHERE event_id = %s""",
                (event_id,),
            )
            stats = await cursor.fetchone()
        if stats is None:
            raise RuntimeError("Submission statistics unavailable")
        return (
            [
                SubmissionItem(
                    id=row[0],
                    eventId=row[1],
                    status=row[2],
                    facebookProofUrl=row[3],
                    completedActionsCount=row[4],
                    pointsAwarded=row[5],
                    submittedAt=row[6],
                    studentId=row[7],
                    studentName=row[8],
                    completedActionIds=row[9],
                    note=row[10],
                )
                for row in rows
            ],
            SubmissionStatistics(
                total=stats[0],
                pending=stats[1],
                approved=stats[2],
                rejected=stats[3],
                totalPointsAwarded=stats[4],
            ),
        )
