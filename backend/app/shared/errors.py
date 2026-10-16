"""Application error types and the single HTTP error response contract."""

from dataclasses import dataclass, field
from typing import cast

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


@dataclass
class ApplicationError(Exception):
    """Represent a safe, client-facing application failure."""

    code: str
    message: str
    status_code: int = 422
    details: list[dict[str, object]] = field(default_factory=list)


def error_payload(
    request: Request,
    code: str,
    message: str,
    details: list[dict[str, object]] | None = None,
) -> dict[str, object]:
    """Build the canonical error envelope with the current request ID."""
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or [],
            "requestId": getattr(request.state, "request_id", None),
        },
    }


async def application_error_handler(request: Request, error: Exception) -> JSONResponse:
    """Convert a domain error into the public error envelope."""
    application_error = cast(ApplicationError, error)
    return JSONResponse(
        status_code=application_error.status_code,
        content=error_payload(
            request,
            application_error.code,
            application_error.message,
            application_error.details,
        ),
    )


async def validation_error_handler(request: Request, error: Exception) -> JSONResponse:
    """Return HTTP 400 for malformed request syntax and fields."""
    validation_error = cast(RequestValidationError, error)
    details: list[dict[str, object]] = []
    for item in validation_error.errors():
        details.append(
            {
                "location": [str(value) for value in item.get("loc", ())],
                "message": str(item.get("msg", "Invalid value")),
            }
        )
    return JSONResponse(
        status_code=400,
        content=error_payload(request, "VALIDATION_ERROR", "Request validation failed", details),
    )


async def http_error_handler(request: Request, error: Exception) -> JSONResponse:
    """Normalize FastAPI HTTP exceptions without exposing implementation details."""
    http_error = cast(HTTPException, error)
    details: list[dict[str, object]] = []
    if isinstance(http_error.detail, dict):
        detail = http_error.detail
        code = str(detail.get("code", "HTTP_ERROR"))
        message = str(detail.get("message", "Yêu cầu không hợp lệ."))
        raw_details = detail.get("details", [])
        if isinstance(raw_details, list):
            details = [
                cast(dict[str, object], item) for item in raw_details if isinstance(item, dict)
            ]
    else:
        code = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            409: "CONFLICT",
            413: "REQUEST_TOO_LARGE",
            422: "BUSINESS_RULE_VIOLATION",
            429: "RATE_LIMITED",
        }.get(http_error.status_code, "HTTP_ERROR")
        message = {
            400: "Yêu cầu không hợp lệ.",
            401: "Yêu cầu xác thực.",
            403: "Không có quyền thực hiện thao tác này.",
            404: "Không tìm thấy tài nguyên.",
            409: "Dữ liệu bị xung đột.",
            413: "Kích thước request vượt giới hạn.",
            422: "Yêu cầu vi phạm quy tắc nghiệp vụ.",
            429: "Quá nhiều request.",
        }.get(http_error.status_code, "Yêu cầu không thành công.")
        if isinstance(http_error.detail, str):
            details = [{"message": http_error.detail}]
    return JSONResponse(
        status_code=http_error.status_code,
        content=error_payload(request, code, message, details),
        headers=http_error.headers,
    )


async def unexpected_error_handler(request: Request, error: Exception) -> JSONResponse:
    """Return a sanitized 500 response while preserving server-side logging."""
    request.app.state.logger.exception("unhandled_exception", exc_info=error)
    return JSONResponse(
        status_code=500,
        content=error_payload(request, "INTERNAL_ERROR", "Internal server error"),
    )
