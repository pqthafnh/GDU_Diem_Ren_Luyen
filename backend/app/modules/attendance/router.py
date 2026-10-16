"""HTTP adapters for QR/GPS attendance."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request

from app.config.settings import get_settings
from app.modules.attendance.schemas import (
    CallStatusRequest,
    CheckInRequest,
    CheckInResponse,
    ManualCheckInRequest,
    ManualCheckOutRequest,
    VerifiedCheckOutRequest,
)
from app.modules.attendance.service import AttendanceService
from app.shared.auth import current_claims
from app.shared.security import create_qr_token

router = APIRouter(tags=["attendance"])


@router.get("/mod/events/{event_id}/projector/qr-token")
@router.get("/events/{event_id}/qr-token", include_in_schema=False)
async def qr_token(
    request: Request, event_id: UUID, claims: dict[str, object] = Depends(current_claims)
) -> dict[str, str]:
    """Issue a short-lived QR token for a MOD-owned event."""
    if claims.get("role") != "MOD":
        raise HTTPException(status_code=403, detail="MOD role required")
    settings = get_settings()
    return {
        "token": create_qr_token(
            event_id,
            settings.jwt_qr_secret,
            settings.jwt_issuer,
            settings.jwt_audience,
            settings.qr_token_ttl_seconds,
        )
    }


@router.post("/attendance/check-in", response_model=CheckInResponse)
async def check_in(
    request: Request,
    body: CheckInRequest,
    claims: dict[str, object] = Depends(current_claims),
) -> CheckInResponse:
    """Validate a student's QR/GPS attendance."""
    if claims.get("role") != "STUDENT":
        raise HTTPException(status_code=403, detail="STUDENT role required")
    try:
        async with request.app.state.database.connection() as connection:
            return await AttendanceService(get_settings()).check_in(
                connection, UUID(str(claims["userId"])), body
            )
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


async def _require_mod(claims: dict[str, object]) -> UUID:
    if claims.get("role") != "MOD":
        raise HTTPException(status_code=403, detail="MOD role required")
    try:
        return UUID(str(claims["userId"]))
    except KeyError as error:
        raise HTTPException(status_code=401, detail="Invalid authentication claims") from error


@router.post("/mod/events/{event_id}/attendance/check-in")
async def manual_check_in(
    request: Request,
    event_id: UUID,
    body: ManualCheckInRequest,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """Record extracurricular check-in selections."""
    moderator_id = await _require_mod(claims)
    try:
        async with request.app.state.database.connection() as connection:
            count = await AttendanceService(get_settings()).manual_check_in(
                connection, event_id, moderator_id, body
            )
        return {"success": True, "checkedInCount": count}
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.post("/mod/events/{event_id}/attendance/check-out")
async def manual_check_out(
    request: Request,
    event_id: UUID,
    body: ManualCheckOutRequest,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """Record check-out selections and return missing students."""
    moderator_id = await _require_mod(claims)
    try:
        async with request.app.state.database.connection() as connection:
            return await AttendanceService(get_settings()).manual_check_out(
                connection, event_id, moderator_id, body
            )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.patch("/mod/events/{event_id}/attendance/call-status")
async def call_status(
    request: Request,
    event_id: UUID,
    body: CallStatusRequest,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """Update the call result for a missing checkout."""
    moderator_id = await _require_mod(claims)
    try:
        async with request.app.state.database.connection() as connection:
            await AttendanceService(get_settings()).update_call_status(
                connection, event_id, moderator_id, body
            )
        return {"success": True, "studentId": body.student_id, "callStatus": body.call_status}
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.post("/mod/events/{event_id}/attendance/check-out-verified")
async def verified_check_out(
    request: Request,
    event_id: UUID,
    body: VerifiedCheckOutRequest,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """Complete follow-up checkout after a MOD phone verification."""
    moderator_id = await _require_mod(claims)
    try:
        async with request.app.state.database.connection() as connection:
            count = await AttendanceService(get_settings()).verify_check_out(
                connection, event_id, moderator_id, body
            )
        return {"success": True, "completedCount": count}
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
