"""FastAPI application entrypoint and lifecycle wiring."""

from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from psycopg import Error as PsycopgError
from starlette.responses import Response

from app.config.settings import get_settings
from app.database.pool import Database
from app.modules.admin_students.router import router as admin_students_router
from app.modules.attendance.router import router as attendance_router
from app.modules.auth.router import router as auth_router
from app.modules.events.router import router as events_router
from app.modules.interactive_submissions.router import router as interactive_router
from app.modules.registrations.router import router as registrations_router
from app.modules.reports.master_router import router as master_report_router
from app.modules.reports.router import router as reports_router
from app.modules.training_points.correction_router import router as correction_router
from app.modules.training_points.router import router as training_points_router
from app.modules.users.router import router as users_router
from app.shared.async_compat import configure_asyncio_policy
from app.shared.errors import (
    ApplicationError,
    application_error_handler,
    http_error_handler,
    unexpected_error_handler,
    validation_error_handler,
)
from app.shared.logging import StructuredLogger, request_logging_middleware
from app.shared.rate_limit import InMemoryRateLimitStorage

configure_asyncio_policy()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Open the shared database pool at startup and close it at shutdown."""
    settings = get_settings()
    database = Database(settings)
    app.state.database = database
    if settings.app_env != "test":
        await database.open()
    try:
        yield
    finally:
        await database.close()


def create_app() -> FastAPI:
    """Create the configured FastAPI application."""
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
    app.state.logger = StructuredLogger()
    app.state.rate_limit_storage = InMemoryRateLimitStorage()
    app.add_exception_handler(ApplicationError, application_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.add_exception_handler(HTTPException, http_error_handler)
    app.add_exception_handler(Exception, unexpected_error_handler)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        """Return process liveness without requiring database access."""
        return {"status": "ok"}

    @app.get("/ready", tags=["health"])
    async def ready(request: Request) -> JSONResponse:
        """Check liveness plus a real PostgreSQL connection."""
        try:
            async with request.app.state.database.connection() as connection:
                await connection.execute("SELECT 1")
        except (RuntimeError, OSError, PsycopgError) as error:
            return JSONResponse(
                status_code=503,
                content={"status": "not_ready", "detail": str(error)},
            )
        return JSONResponse(status_code=200, content={"status": "ready"})

    @app.middleware("http")
    async def request_id_middleware(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Attach a request ID to every response for operational correlation."""
        request_id = request.headers.get("X-Request-ID", str(uuid4()))
        request.state.request_id = request_id
        content_length = request.headers.get("content-length")
        try:
            body_size = int(content_length) if content_length is not None else 0
        except ValueError:
            body_size = settings.max_request_body_bytes + 1
        if body_size > settings.max_request_body_bytes:
            response: Response = JSONResponse(
                status_code=413,
                content={
                    "success": False,
                    "error": {
                        "code": "REQUEST_TOO_LARGE",
                        "message": "Request body is too large",
                        "details": [],
                        "requestId": request_id,
                    },
                },
            )
            response.headers["X-Request-ID"] = request_id
            return response
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

    @app.middleware("http")
    async def auth_rate_limit_middleware(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        """Limit authentication endpoints with replaceable development storage."""
        if request.url.path.startswith("/api/auth/") and request.method == "POST":
            key = f"{request.client.host if request.client else 'unknown'}:{request.url.path}"
            allowed, remaining = app.state.rate_limit_storage.hit(
                key, settings.auth_rate_limit_requests, settings.auth_rate_limit_window_seconds
            )
            if not allowed:
                response: Response = JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "error": {
                            "code": "RATE_LIMITED",
                            "message": "Too many requests",
                            "details": [],
                            "requestId": getattr(request.state, "request_id", None),
                        },
                    },
                    headers={"Retry-After": str(settings.auth_rate_limit_window_seconds)},
                )
                response.headers["X-RateLimit-Remaining"] = str(remaining)
                return response
            response = await call_next(request)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            return response
        return await call_next(request)

    app.middleware("http")(request_logging_middleware)

    app.include_router(auth_router, prefix="/api/auth")
    app.include_router(events_router, prefix="/api")
    app.include_router(users_router, prefix="/api/users")
    app.include_router(admin_students_router, prefix="/api/admin")
    app.include_router(registrations_router, prefix="/api/student")
    app.include_router(attendance_router, prefix="/api")
    app.include_router(interactive_router, prefix="/api")
    app.include_router(training_points_router, prefix="/api/student/training-points")
    app.include_router(correction_router, prefix="/api/mod/training-points")
    app.include_router(reports_router, prefix="/api")
    app.include_router(master_report_router, prefix="/api")
    return app


app = create_app()
