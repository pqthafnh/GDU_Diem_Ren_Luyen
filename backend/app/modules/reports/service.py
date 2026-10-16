"""PostgreSQL report queries and Excel workbook generation."""

from io import BytesIO
from uuid import UUID

import anyio
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font
from psycopg import AsyncConnection

HEADERS = [
    "STT",
    "MSSV",
    "Họ",
    "Tên",
    "Giới tính",
    "Ngày sinh",
    "Lớp",
    "Ngành",
    "Tên hoạt động",
    "Tổng",
]


def sanitize_excel_value(value: object) -> object:
    """Prefix potentially executable spreadsheet text with an apostrophe."""
    if isinstance(value, str) and value.startswith(("=", "+", "-", "@")):
        return "'" + value
    return value


def build_event_workbook(rows: list[tuple[object, ...]]) -> BytesIO:
    """Build a UTF-8-capable event report workbook in memory."""
    workbook = Workbook()
    sheet = workbook.active
    if sheet is None:
        raise RuntimeError("Workbook did not create an active sheet")
    sheet.title = "Bao cao diem danh"
    sheet.append(HEADERS)
    for cell in sheet[1]:
        cell.font = Font(bold=True)
        cell.alignment = Alignment(wrap_text=True)
    for row in rows:
        sheet.append([sanitize_excel_value(value) for value in row])
    sheet.freeze_panes = "A2"
    sheet.auto_filter.ref = sheet.dimensions
    for index, column in enumerate(sheet.columns, start=1):
        width = min(max(max(len(str(cell.value or "")) for cell in column) + 2, 10), 35)
        sheet.column_dimensions[chr(64 + index)].width = width
    output = BytesIO()
    workbook.save(output)
    output.seek(0)
    return output


class ReportService:
    """Builds reports from attendance and immutable ledger state."""

    async def event_rows(
        self, connection: AsyncConnection, event_id: UUID, moderator_id: UUID
    ) -> list[tuple[object, ...]]:
        """Return the ten required event-report columns for an owned event."""
        async with connection.cursor() as cursor:
            await cursor.execute(
                """SELECT e.id FROM events e
                   WHERE e.id = %s AND e.created_by = %s AND e.deleted_at IS NULL""",
                (event_id, moderator_id),
            )
            if await cursor.fetchone() is None:
                raise ValueError("MOD does not own this event")
            await cursor.execute(
                """SELECT u.student_id, u.last_name, u.first_name, u.gender, u.birth_date,
                          u.class_name, u.major, e.title,
                          COALESCE(SUM(l.points_awarded), 0)
                   FROM tickets t
                   JOIN users u ON u.id = t.student_id
                   JOIN events e ON e.id = t.event_id
                   LEFT JOIN training_points_ledger l
                     ON l.student_id = t.student_id AND l.event_id = t.event_id
                   WHERE t.event_id = %s AND t.status <> 'CANCELLED'
                   GROUP BY u.student_id, u.last_name, u.first_name, u.gender, u.birth_date,
                            u.class_name, u.major, e.title
                   ORDER BY u.student_id""",
                (event_id,),
            )
            rows = await cursor.fetchall()
        return [(index, *row) for index, row in enumerate(rows, start=1)]

    async def event_workbook(
        self, connection: AsyncConnection, event_id: UUID, moderator_id: UUID
    ) -> BytesIO:
        """Query an event report and generate its workbook off the event loop."""
        rows = await self.event_rows(connection, event_id, moderator_id)
        return await anyio.to_thread.run_sync(build_event_workbook, rows)
