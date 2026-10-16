"""Business service for the administrator student directory."""

from collections.abc import Sequence
from datetime import date, datetime
from typing import cast
from uuid import UUID

from psycopg import AsyncConnection

from app.modules.admin_students.schemas import (
    DeleteResult,
    StudentCreate,
    StudentDirectoryResponse,
    StudentResponse,
    StudentYearGroup,
)
from app.shared.security import hash_password


def _split_name(full_name: str) -> tuple[str, str]:
    """Split a full name into the legacy last-name and first-name columns."""
    parts = full_name.split()
    return (" ".join(parts[:-1]) or parts[0], parts[-1])


StudentRow = tuple[
    UUID, str, str, str, str, date, str | None, str | None, str | None, int, datetime
]


def _student_response(row: Sequence[object]) -> StudentResponse:
    """Map a student database row to the public admin response."""
    typed_row = cast(StudentRow, tuple(row))
    return StudentResponse(
        id=typed_row[0],
        studentId=typed_row[1],
        fullName=typed_row[2],
        email=typed_row[3],
        gender=typed_row[4],
        birthDate=typed_row[5],
        className=typed_row[6],
        major=typed_row[7],
        phoneNumber=typed_row[8],
        enrollmentYear=typed_row[9],
        createdAt=typed_row[10].isoformat(),
    )


class AdminStudentService:
    """Owns transactional student account administration."""

    async def list_students(
        self,
        connection: AsyncConnection,
        search: str | None,
        enrollment_year: int | None,
        page: int,
        limit: int,
    ) -> StudentDirectoryResponse:
        """List students with search, year grouping and bounded pagination."""
        conditions = ["role = 'STUDENT'"]
        values: list[object] = []
        if search:
            conditions.append("(student_id ILIKE %s OR full_name ILIKE %s OR email ILIKE %s)")
            term = f"%{search.strip()}%"
            values.extend([term, term, term])
        if enrollment_year is not None:
            conditions.append("enrollment_year = %s")
            values.append(enrollment_year)
        where = " AND ".join(conditions)
        offset = (page - 1) * limit
        async with connection.cursor() as cursor:
            await cursor.execute(f"SELECT COUNT(*) FROM users WHERE {where}", values)
            total_row = await cursor.fetchone()
            if total_row is None:
                raise RuntimeError("Student count query returned no row")
            total = int(total_row[0])
            await cursor.execute(
                f"""SELECT id, student_id, full_name, email, gender, birth_date,
                           class_name, major, phone_number, enrollment_year, created_at
                    FROM users WHERE {where}
                    ORDER BY enrollment_year DESC, student_id
                    LIMIT %s OFFSET %s""",
                [*values, limit, offset],
            )
            rows = await cursor.fetchall()
            await cursor.execute(
                """SELECT enrollment_year, COUNT(*) FROM users
                   WHERE role = 'STUDENT' AND enrollment_year IS NOT NULL
                   GROUP BY enrollment_year ORDER BY enrollment_year DESC"""
            )
            years = await cursor.fetchall()
        return StudentDirectoryResponse(
            students=[_student_response(row) for row in rows],
            years=[StudentYearGroup(enrollmentYear=row[0], count=row[1]) for row in years],
            total=total,
            page=page,
            limit=limit,
        )

    async def create_student(
        self, connection: AsyncConnection, student: StudentCreate
    ) -> StudentResponse:
        """Create one student account atomically and return its directory row."""
        last_name, first_name = _split_name(student.full_name)
        async with connection.cursor() as cursor:
            await cursor.execute(
                """INSERT INTO users (
                       student_id, last_name, first_name, full_name, gender, birth_date,
                       class_name, major, phone_number, email, password_hash,
                       is_password_changed, role, enrollment_year
                   ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE, 'STUDENT', %s)
                   RETURNING id, student_id, full_name, email, gender, birth_date,
                             class_name, major, phone_number, enrollment_year, created_at""",
                (
                    student.student_id,
                    last_name,
                    first_name,
                    student.full_name,
                    student.gender,
                    student.birth_date,
                    student.class_name,
                    student.major,
                    student.phone_number,
                    str(student.email),
                    hash_password(student.initial_password),
                    student.enrollment_year,
                ),
            )
            row = await cursor.fetchone()
        if row is None:
            raise RuntimeError("Student insert returned no row")
        return _student_response(row)

    async def create_students(
        self, connection: AsyncConnection, students: list[StudentCreate]
    ) -> list[StudentResponse]:
        """Insert an Excel batch in one transaction; any conflict rolls back all rows."""
        if not students:
            raise ValueError("The import file contains no students")
        async with connection.transaction():
            return [await self.create_student(connection, student) for student in students]

    async def delete_student(self, connection: AsyncConnection, student_uuid: UUID) -> DeleteResult:
        """Delete one student account, rejecting non-student administrative accounts."""
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    "DELETE FROM users WHERE id = %s AND role = 'STUDENT'", (student_uuid,)
                )
                deleted = cursor.rowcount
        return DeleteResult(deletedCount=deleted)

    async def delete_year(self, connection: AsyncConnection, enrollment_year: int) -> DeleteResult:
        """Delete every student in one enrollment year in a single transaction."""
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    "DELETE FROM users WHERE role = 'STUDENT' AND enrollment_year = %s",
                    (enrollment_year,),
                )
                deleted = cursor.rowcount
        return DeleteResult(deletedCount=deleted)
