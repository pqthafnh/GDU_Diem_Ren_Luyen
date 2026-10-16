"""Single application-wide psycopg asynchronous connection pool."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from psycopg import AsyncConnection
from psycopg_pool import AsyncConnectionPool

from app.config.settings import Settings


class Database:
    """Owns the one PostgreSQL pool used by every module."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self.pool: AsyncConnectionPool[AsyncConnection] | None = None

    async def open(self) -> None:
        """Open and validate the configured PostgreSQL pool."""
        self.pool = AsyncConnectionPool(
            conninfo=self._settings.database_url,
            min_size=self._settings.database_pool_min_size,
            max_size=self._settings.database_pool_max_size,
            timeout=self._settings.database_pool_timeout_seconds,
            open=False,
        )
        await self.pool.open(wait=True)

    async def close(self) -> None:
        """Close the pool and release all database connections."""
        if self.pool is not None:
            await self.pool.close()
            self.pool = None

    @asynccontextmanager
    async def connection(self) -> AsyncIterator[AsyncConnection]:
        """Borrow a connection for one request or transaction."""
        if self.pool is None:
            raise RuntimeError("Database pool is not open")
        async with self.pool.connection() as connection:
            yield connection
