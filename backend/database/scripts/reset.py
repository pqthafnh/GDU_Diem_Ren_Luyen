"""Reset the development database explicitly."""

import asyncio

import psycopg

from app.config.settings import get_settings
from app.shared.async_compat import configure_asyncio_policy


async def reset() -> None:
    """Drop application tables in a development database, preserving the database itself."""
    async with await psycopg.AsyncConnection.connect(get_settings().database_url) as connection:
        async with connection.transaction():
            await connection.execute(
                "DROP TABLE IF EXISTS system_audit_logs, training_points_ledger, attendance, "
                "tickets, interactive_actions, events, users, schema_migrations CASCADE"
            )


if __name__ == "__main__":
    configure_asyncio_policy()
    asyncio.run(reset())
