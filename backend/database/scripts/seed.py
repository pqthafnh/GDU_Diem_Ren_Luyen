"""Idempotently seed local development accounts and demo records."""

import asyncio
import json
from datetime import UTC, date, datetime, timedelta
from uuid import UUID

import psycopg

from app.config.settings import get_settings
from app.shared.async_compat import configure_asyncio_policy
from app.shared.security import hash_password


async def seed() -> None:
    """Insert stable development accounts and representative demo records.

    The workflow is idempotent: all stable identities are selected by email and
    all dependent records use conflict-safe keys. This seed is for local
    development only and never runs from application startup.
    """
    async with await psycopg.AsyncConnection.connect(get_settings().database_url) as connection:
        async with connection.transaction():
            await connection.execute(
                """INSERT INTO users
                   (student_id, last_name, first_name, full_name, birth_date, email,
                    password_hash, is_password_changed, role)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE, %s)
                   ON CONFLICT (email) DO NOTHING""",
                (
                    "2024001",
                    "Nguyen Van",
                    "An",
                    "Nguyen Van An",
                    date(2004, 8, 15),
                    "2024001@gdu.edu.vn",
                    hash_password("GDU@AN1508"),
                    "STUDENT",
                ),
            )
            await connection.execute(
                "UPDATE users SET password_hash = %s, is_password_changed = TRUE WHERE email = %s",
                (hash_password("GDU@AN1508"), "2024001@gdu.edu.vn"),
            )
            accounts = [
                ("GDU", "Moderator", "GDU Moderator", "mod@gdu.edu.vn", "Mod@123", "MOD"),
                ("GDU", "Moderator Two", "GDU Moderator Two", "mod2@gdu.edu.vn", "Mod2@123", "MOD"),
                (
                    "GDU",
                    "Administrator",
                    "GDU Administrator",
                    "admin@gdu.edu.vn",
                    "Admin@123",
                    "ADMIN",
                ),
            ]
            for last_name, first_name, full_name, email, password, role in accounts:
                await connection.execute(
                    """INSERT INTO users
                       (last_name, first_name, full_name, birth_date, email, password_hash,
                        is_password_changed, role)
                       VALUES (%s, %s, %s, %s, %s, %s, TRUE, %s)
                       ON CONFLICT (email) DO NOTHING""",
                    (
                        last_name,
                        first_name,
                        full_name,
                        date(1990, 1, 1),
                        email,
                        hash_password(password),
                        role,
                    ),
                )
                await connection.execute(
                    "UPDATE users SET password_hash = %s, is_password_changed = TRUE "
                    "WHERE email = %s",
                    (hash_password(password), email),
                )
            students = [
                ("2024002", "Tran Thi", "Binh", "2024002@gdu.edu.vn", "Binh"),
                ("2024003", "Le Hoang", "Cuong", "2024003@gdu.edu.vn", "Cuong"),
                ("2024004", "Pham Thuy", "Duyen", "2024004@gdu.edu.vn", "Duyen"),
                ("2024005", "Hoang Minh", "Duc", "2024005@gdu.edu.vn", "Duc"),
                ("2024006", "Vo Ngoc", "Ha", "2024006@gdu.edu.vn", "Ha"),
                ("2024007", "Doan Gia", "Khanh", "2024007@gdu.edu.vn", "Khanh"),
                ("2024008", "Bui Thanh", "Lam", "2024008@gdu.edu.vn", "Lam"),
                ("2024009", "Nguyen Bao", "Minh", "2024009@gdu.edu.vn", "Minh"),
                ("2024010", "Pham Quoc", "Nam", "2024010@gdu.edu.vn", "Nam"),
            ]
            for student_id, last_name, first_name, email, first_name_ascii in students:
                await connection.execute(
                    """INSERT INTO users
                       (student_id, last_name, first_name, full_name, birth_date,
                        class_name, major, phone_number, email, password_hash,
                        is_password_changed, role)
                       VALUES (%s, %s, %s, %s, %s, '2401CNTT01',
                               'Công nghệ thông tin', %s, %s, %s, TRUE, 'STUDENT')
                       ON CONFLICT (email) DO NOTHING""",
                    (
                        student_id,
                        last_name,
                        first_name,
                        f"{last_name} {first_name}",
                        date(2004, 1, 1),
                        f"09081234{student_id[-2:]}",
                        email,
                        hash_password(f"GDU@{first_name_ascii.upper()}0101"),
                    ),
                )
                await connection.execute(
                    "UPDATE users SET password_hash = %s, is_password_changed = TRUE "
                    "WHERE email = %s",
                    (hash_password(f"GDU@{first_name_ascii.upper()}0101"), email),
                )

            users: dict[str, UUID] = {}
            async with connection.cursor() as cursor:
                await cursor.execute(
                    "SELECT id, email FROM users WHERE email = ANY(%s)",
                    (
                        ["mod@gdu.edu.vn", "mod2@gdu.edu.vn", "admin@gdu.edu.vn"]
                        + [student[3] for student in students]
                        + ["2024001@gdu.edu.vn"],
                    ),
                )
                users = {row[1]: row[0] for row in await cursor.fetchall()}

            now = datetime.now(UTC)
            event_specs = [
                ("GDU Demo Workshop", "PUBLISHED", "STANDARD", "QR_GPS", 5, 15),
                ("GDU Demo Waitlist", "PUBLISHED", "STANDARD", "MANUAL_ROLLCALL", 2, 10),
                (
                    "GDU Demo Facebook Challenge",
                    "PUBLISHED",
                    "INTERACTIVE",
                    "SOCIAL_INTERACTIVE",
                    None,
                    3,
                ),
                ("GDU Demo Pending Review", "PENDING_REVIEW", "STANDARD", "QR_GPS", 20, 8),
            ]
            event_ids: dict[str, UUID] = {}
            for title, status, event_type, check_in_method, capacity, points in event_specs:
                async with connection.cursor() as cursor:
                    await cursor.execute(
                        "SELECT id FROM events WHERE title = %s AND created_by = %s LIMIT 1",
                        (title, users["mod@gdu.edu.vn"]),
                    )
                    row = await cursor.fetchone()
                if row is None:
                    async with connection.cursor() as cursor:
                        await cursor.execute(
                            """INSERT INTO events
                               (title, description, category, event_type, check_in_method,
                                start_time, end_time, location_name, gps_lat, gps_lng,
                                capacity, points_reward, status, created_by)
                               VALUES (%s, %s, 'ACADEMIC', %s, %s, %s, %s, 'GDU Campus',
                                       10.801, 106.665, %s, %s, %s, %s) RETURNING id""",
                            (
                                title,
                                f"Seed data for {title}",
                                event_type,
                                check_in_method,
                                now - timedelta(hours=1),
                                now + timedelta(hours=2),
                                capacity,
                                points,
                                status,
                                users["mod@gdu.edu.vn"],
                            ),
                        )
                        row = await cursor.fetchone()
                if row is not None:
                    event_ids[title] = row[0]

            workshop_id = event_ids["GDU Demo Workshop"]
            waitlist_id = event_ids["GDU Demo Waitlist"]
            interactive_id = event_ids["GDU Demo Facebook Challenge"]
            student_emails = [student[3] for student in students]
            for index, email in enumerate(student_emails):
                event_id = workshop_id if index < 5 else waitlist_id
                status = "OFFICIAL" if index < 5 else "WAITLIST"
                await connection.execute(
                    """INSERT INTO tickets (event_id, student_id, status, queue_number, seat_number)
                       VALUES (%s, %s, %s, %s, %s)
                       ON CONFLICT (event_id, student_id) DO NOTHING""",
                    (
                        event_id,
                        users[email],
                        status,
                        index + 1,
                        f"A-{index + 1}" if status == "OFFICIAL" else None,
                    ),
                )
            first_student = users[student_emails[0]]
            async with connection.cursor() as cursor:
                await cursor.execute(
                    "SELECT id FROM tickets WHERE event_id = %s AND student_id = %s",
                    (workshop_id, first_student),
                )
                ticket = await cursor.fetchone()
            if ticket is not None:
                await connection.execute(
                    """INSERT INTO attendance
                       (event_id, student_id, ticket_id, scanned_lat, scanned_lng,
                        distance_meters, status)
                       VALUES (%s, %s, %s, 10.801, 106.665, 5, 'CHECKED_IN')
                       ON CONFLICT (event_id, student_id) DO NOTHING""",
                    (workshop_id, first_student, ticket[0]),
                )
                await connection.execute(
                    """INSERT INTO training_points_ledger
                       (student_id, event_id, points_awarded, criteria_category,
                        semester, academic_year, note, source_type, source_id, idempotency_key)
                       VALUES (%s, %s, 15, 'ACADEMIC', 'HK1', '2026-2027',
                               'Seed attendance', 'ATTENDANCE', %s, %s)
                       ON CONFLICT (idempotency_key) DO NOTHING""",
                    (
                        first_student,
                        workshop_id,
                        ticket[0],
                        f"ATTENDANCE:{ticket[0]}:{first_student}",
                    ),
                )
            action_id = await connection.execute(
                """INSERT INTO interactive_actions
                   (event_id, action_type, label, description, points_reward, order_index)
                   VALUES (%s, 'FACEBOOK', 'Like and share', 'Seed action', 1, 1)
                   ON CONFLICT (event_id, action_type) DO UPDATE SET label = EXCLUDED.label
                   RETURNING id""",
                (interactive_id,),
            )
            action_row = await action_id.fetchone()
            if action_row is not None:
                await connection.execute(
                    """INSERT INTO interactive_submissions
                       (event_id, student_id, facebook_proof_url, submitted_actions,
                        status, points_awarded)
                       VALUES (%s, %s, 'https://www.facebook.com/gdu.demo',
                               %s::jsonb, 'APPROVED', 1)
                       ON CONFLICT (event_id, student_id) DO NOTHING""",
                    (interactive_id, users[student_emails[1]], json.dumps([str(action_row[0])])),
                )


if __name__ == "__main__":
    configure_asyncio_policy()
    asyncio.run(seed())
