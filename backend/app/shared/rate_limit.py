"""Rate limiting with a replaceable storage interface."""

from collections import defaultdict
from time import monotonic
from typing import Protocol


class RateLimitStorage(Protocol):
    """Storage contract suitable for a future Redis/PostgreSQL implementation."""

    def hit(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        """Record a hit and return whether it is allowed plus remaining quota."""


class InMemoryRateLimitStorage:
    """Single-process development limiter; not a distributed production solution."""

    def __init__(self) -> None:
        self._entries: defaultdict[str, list[float]] = defaultdict(list)

    def hit(self, key: str, limit: int, window_seconds: int) -> tuple[bool, int]:
        """Apply a fixed sliding-window limit for one client key."""
        now = monotonic()
        entries = [
            timestamp for timestamp in self._entries[key] if timestamp > now - window_seconds
        ]
        entries.append(now)
        self._entries[key] = entries
        return len(entries) <= limit, max(0, limit - len(entries))
