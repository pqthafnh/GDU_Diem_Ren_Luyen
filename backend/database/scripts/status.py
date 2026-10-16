"""Show applied PostgreSQL migrations."""

import asyncio

import psycopg

from app.config.settings import get_settings
from app.shared.async_compat import configure_asyncio_policy


async def status() -> None:
    """Print migration names and checksums from the live database."""
    async with await psycopg.AsyncConnection.connect(get_settings().database_url) as connection:
        cursor = await connection.execute(
            "SELECT name, checksum, applied_at, execution_time_ms "
            "FROM schema_migrations ORDER BY name"
        )
        for row in await cursor.fetchall():
            print(f"{row[0]} {row[1]} {row[2].isoformat()} {row[3]}ms")


if __name__ == "__main__":
    configure_asyncio_policy()
    asyncio.run(status())
