"""PostgreSQL-backed fixtures for integration, E2E and concurrency tests."""

import os
from collections.abc import AsyncIterator
from datetime import UTC, datetime, timedelta
from pathlib import Path
from uuid import UUID, uuid4

import httpx
import psycopg
import pytest_asyncio

from app.config.settings import Settings
from app.database.pool import Database
from app.main import create_app
from app.shared.security import hash_password

ROOT = Path(__file__).resolve().parents[1]
DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    os.environ.get("DATABASE_URL", "postgresql://gdu:gdu@localhost:5432/gdu_event_training"),
)


class TestOtpEmailSender:
    """Capture test-mode delivery without contacting an external SMTP server."""

    async def send_otp(self, recipient: str, otp: str, ttl_minutes: int) -> None:
        """Accept test delivery while keeping the OTP available only to the test."""


@pytest_asyncio.fixture(scope="session")
async def test_settings() -> AsyncIterator[Settings]:
    """Provide settings targeting the real PostgreSQL test database."""
    yield Settings(database_url=DATABASE_URL, app_env="test")


@pytest_asyncio.fixture(scope="session", autouse=True)
async def prepared_database(test_settings: Settings) -> AsyncIterator[None]:
    """Apply migrations and isolate the test schema for this test session."""
    from database.scripts.migrate import MIGRATIONS

    async with await psycopg.AsyncConnection.connect(test_settings.database_url) as connection:
        async with connection.transaction():
            await connection.execute(
                "DROP TABLE IF EXISTS interactive_submissions, system_audit_logs, "
                "training_points_ledger, attendance, tickets, interactive_actions, "
                "events, users, schema_migrations CASCADE"
            )
    async with await psycopg.AsyncConnection.connect(test_settings.database_url) as connection:
        async with connection.transaction():
            await connection.execute(
                "CREATE TABLE schema_migrations (name VARCHAR(255) PRIMARY KEY, "
                "checksum CHAR(64) NOT NULL, "
                "applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, "
                "execution_time_ms INTEGER NOT NULL)"
            )
            import hashlib

            for path in sorted(MIGRATIONS.glob("*.sql")):
                content = path.read_bytes()
                await connection.execute(content.decode())
                await connection.execute(
                    "INSERT INTO schema_migrations (name, checksum, execution_time_ms) "
                    "VALUES (%s, %s, 0)",
                    (path.name, hashlib.sha256(content).hexdigest()),
                )
    yield


@pytest_asyncio.fixture
async def database(test_settings: Settings) -> AsyncIterator[Database]:
    """Open an application-compatible PostgreSQL connection pool."""
    database = Database(test_settings)
    await database.open()
    try:
        yield database
    finally:
        await database.close()


@pytest_asyncio.fixture
async def seeded_users(database: Database) -> dict[str, UUID]:
    """Create isolated student, MOD and ADMIN accounts for one test."""
    async with database.connection() as connection:
        async with connection.transaction():
            ids: dict[str, UUID] = {}
            for role, email in (
                ("STUDENT", f"student-{uuid4()}@test.gdu.edu.vn"),
                ("MOD", f"mod-{uuid4()}@test.gdu.edu.vn"),
                ("ADMIN", f"admin-{uuid4()}@test.gdu.edu.vn"),
            ):
                student_id = f"{uuid4().hex[:8]}"
                cursor = await connection.execute(
                    """INSERT INTO users
                       (student_id, last_name, first_name, full_name, birth_date, email,
                        password_hash, is_password_changed, role)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE, %s)
                       RETURNING id""",
                    (
                        student_id,
                        "Test",
                        role,
                        f"Test {role}",
                        "2000-01-01",
                        email,
                        hash_password("Test@123"),
                        role,
                    ),
                )
                row = await cursor.fetchone()
                if row is None:
                    raise RuntimeError("Test user insert returned no row")
                ids[role] = row[0]
    return ids


@pytest_asyncio.fixture
async def standard_event(database: Database, seeded_users: dict[str, UUID]) -> UUID:
    """Create a published standard event with five seats."""
    event_id = uuid4()
    async with database.connection() as connection:
        await connection.execute(
            """INSERT INTO events
               (id, title, description, category, event_type, check_in_method,
                start_time, end_time, location_name, gps_lat, gps_lng,
                gps_radius_meters, capacity, points_reward, status, created_by)
               VALUES (%s, 'Test event', 'Integration event', 'ACADEMIC', 'STANDARD',
                       'QR_GPS', %s, %s, 'GDU', 10.8, 106.6, 100, 5, 15,
                       'PUBLISHED', %s)""",
            (
                event_id,
                datetime.now(UTC) - timedelta(hours=1),
                datetime.now(UTC) + timedelta(hours=1),
                seeded_users["MOD"],
            ),
        )
    return event_id


@pytest_asyncio.fixture
async def client(test_settings: Settings) -> AsyncIterator[httpx.AsyncClient]:
    """Run the FastAPI lifespan against the PostgreSQL test database."""
    app = create_app()
    app.state.email_sender = TestOtpEmailSender()
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as value:
            yield value
