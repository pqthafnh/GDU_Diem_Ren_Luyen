"""Structured JSON request logging with sensitive-value redaction."""

import json
import logging
import time
from collections.abc import Awaitable, Callable

from fastapi import Request
from starlette.responses import Response

SENSITIVE_KEYS = {
    "password",
    "confirmpassword",
    "otp",
    "token",
    "authorization",
    "database_url",
    "smtp_password",
    "resend_api_key",
    "api_key",
}


class StructuredLogger:
    """Emit one JSON object per application event."""

    def __init__(self) -> None:
        self._logger = logging.getLogger("gdu_event_training")

    def info(self, event: str, **fields: object) -> None:
        """Write an informational structured event."""
        self._logger.info(json.dumps({"event": event, **redact(fields)}, default=str))

    def exception(self, event: str, exc_info: BaseException) -> None:
        """Write an exception event without serializing exception internals to clients."""
        self._logger.exception(
            json.dumps({"event": event, "errorType": type(exc_info).__name__}, default=str)
        )


def redact(fields: dict[str, object]) -> dict[str, object]:
    """Redact sensitive keys recursively before they reach logs."""
    redacted: dict[str, object] = {}
    for key, value in fields.items():
        if key.lower().replace("-", "_") in SENSITIVE_KEYS:
            redacted[key] = "[REDACTED]"
        elif isinstance(value, dict):
            redacted[key] = redact(value)
        else:
            redacted[key] = value
    return redacted


async def request_logging_middleware(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """Log request ID, route, status, duration, and authenticated identity."""
    started = time.perf_counter()
    response = await call_next(request)
    claims = getattr(request.state, "claims", {})
    request.app.state.logger.info(
        "request_completed",
        requestId=getattr(request.state, "request_id", None),
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        durationMs=round((time.perf_counter() - started) * 1000, 2),
        userId=claims.get("userId") if isinstance(claims, dict) else None,
        role=claims.get("role") if isinstance(claims, dict) else None,
    )
    return response
