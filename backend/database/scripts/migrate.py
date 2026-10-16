"""Apply checked, transactional PostgreSQL migrations."""

import asyncio
import hashlib
import time
from pathlib import Path

import psycopg

from app.config.settings import get_settings
from app.shared.async_compat import configure_asyncio_policy

MIGRATIONS = Path(__file__).resolve().parents[1] / "migrations"


async def migrate() -> None:
    """Apply pending migrations under a PostgreSQL advisory lock."""
    settings = get_settings()
    async with await psycopg.AsyncConnection.connect(settings.database_url) as connection:
        async with connection.transaction():
            await connection.execute("SELECT pg_advisory_xact_lock(%s)", (847201,))
            await connection.execute(
                "CREATE TABLE IF NOT EXISTS schema_migrations "
                "(name VARCHAR(255) PRIMARY KEY, checksum CHAR(64) NOT NULL, "
                "applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, "
                "execution_time_ms INTEGER NOT NULL)"
            )
            for path in sorted(MIGRATIONS.glob("*.sql")):
                content = path.read_bytes()
                checksum = hashlib.sha256(content).hexdigest()
                row = await connection.execute(
                    "SELECT checksum FROM schema_migrations WHERE name = %s", (path.name,)
                )
                existing = await row.fetchone()
                if existing is not None:
                    if existing[0] != checksum:
                        raise RuntimeError(f"Migration checksum changed: {path.name}")
                    continue
                started = time.perf_counter()
                await connection.execute(content.decode("utf-8"))
                elapsed = round((time.perf_counter() - started) * 1000)
                await connection.execute(
                    "INSERT INTO schema_migrations "
                    "(name, checksum, execution_time_ms) VALUES (%s, %s, %s)",
                    (path.name, checksum, elapsed),
                )


if __name__ == "__main__":
    configure_asyncio_policy()
    asyncio.run(migrate())
