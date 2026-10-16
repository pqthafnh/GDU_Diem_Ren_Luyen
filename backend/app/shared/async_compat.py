"""Platform compatibility for asynchronous PostgreSQL I/O."""

import asyncio
import sys


def configure_asyncio_policy() -> None:
    """Use a selector loop on Windows because psycopg async requires it."""
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
