"""Training points ledger read workflows."""

from uuid import UUID

from psycopg import AsyncConnection

from app.modules.training_points.schemas import PointHistoryItem, TrainingPointsResponse


def classify_points(total: int) -> str:
    """Classify a cumulative total using the canonical GDU boundaries."""
    if total >= 90:
        return "Xuất sắc"
    if total >= 80:
        return "Giỏi"
    if total >= 65:
        return "Khá"
    if total >= 50:
        return "Trung bình"
    if total >= 35:
        return "Yếu"
    return "Kém"


class TrainingPointsService:
    """Reads append-only ledger data without changing cumulative history."""

    async def get_student_points(
        self,
        connection: AsyncConnection,
        student_id: UUID,
        semester: str | None = None,
        academic_year: str | None = None,
    ) -> TrainingPointsResponse:
        """Return cumulative total, filtered total and paginated-free history."""
        async with connection.cursor() as cursor:
            await cursor.execute(
                "SELECT COALESCE(SUM(points_awarded), 0) FROM training_points_ledger "
                "WHERE student_id = %s",
                (student_id,),
            )
            cumulative_row = await cursor.fetchone()
            await cursor.execute(
                """SELECT COALESCE(SUM(points_awarded), 0)
                   FROM training_points_ledger
                   WHERE student_id = %s
                     AND (%s IS NULL OR semester = %s)
                     AND (%s IS NULL OR academic_year = %s)""",
                (student_id, semester, semester, academic_year, academic_year),
            )
            filtered_row = await cursor.fetchone()
            await cursor.execute(
                """SELECT l.id, e.title, l.points_awarded, l.criteria_category,
                          l.semester, l.academic_year, l.source_type, l.correction_of,
                          l.created_at
                   FROM training_points_ledger l
                   LEFT JOIN events e ON e.id = l.event_id
                   WHERE l.student_id = %s
                     AND (%s IS NULL OR l.semester = %s)
                     AND (%s IS NULL OR l.academic_year = %s)
                   ORDER BY l.created_at DESC""",
                (student_id, semester, semester, academic_year, academic_year),
            )
            rows = await cursor.fetchall()
        cumulative = int(cumulative_row[0]) if cumulative_row else 0
        filtered = int(filtered_row[0]) if filtered_row else 0
        return TrainingPointsResponse(
            cumulativeTotal3Years=cumulative,
            classification=classify_points(cumulative),
            filteredTotal=filtered,
            history=[
                PointHistoryItem(
                    id=row[0],
                    eventTitle=row[1],
                    points=row[2],
                    category=row[3],
                    semester=row[4],
                    academicYear=row[5],
                    sourceType=row[6],
                    correctionOf=row[7],
                    earnedAt=row[8],
                )
                for row in rows
            ],
        )
