"""HTTP adapters for interactive proof submission and verification."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request

from app.modules.interactive_submissions.schemas import (
    SubmissionRequest,
    SubmissionResponse,
    VerifySubmissionRequest,
)
from app.modules.interactive_submissions.service import InteractiveSubmissionService
from app.shared.auth import current_claims

router = APIRouter(tags=["interactive-submissions"])


@router.post(
    "/student/events/{event_id}/interactive-submissions",
    response_model=SubmissionResponse,
    status_code=201,
)
async def submit(
    request: Request,
    event_id: UUID,
    body: SubmissionRequest,
    claims: dict[str, object] = Depends(current_claims),
) -> SubmissionResponse:
    """Submit one Facebook proof for an interactive event."""
    if claims.get("role") != "STUDENT":
        raise HTTPException(status_code=403, detail="STUDENT role required")
    try:
        async with request.app.state.database.connection() as connection:
            return await InteractiveSubmissionService().submit(
                connection, event_id, UUID(str(claims["userId"])), body
            )
    except RuntimeError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.patch("/mod/events/{event_id}/interactive-submissions/{submission_id}/verify")
async def verify(
    request: Request,
    event_id: UUID,
    submission_id: UUID,
    body: VerifySubmissionRequest,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """Verify a proof submitted for a MOD-owned event."""
    if claims.get("role") != "MOD":
        raise HTTPException(status_code=403, detail="MOD role required")
    try:
        async with request.app.state.database.connection() as connection:
            result = await InteractiveSubmissionService().verify(
                connection, event_id, submission_id, UUID(str(claims["userId"])), body
            )
        return {"success": True, "status": result, "pointsAwarded": body.points_awarded}
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.get("/mod/events/{event_id}/interactive-submissions")
async def list_submissions(
    request: Request,
    event_id: UUID,
    status: str | None = None,
    page: int = 1,
    limit: int = 20,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """List MOD-owned interactive submissions with statistics."""
    if claims.get("role") != "MOD":
        raise HTTPException(status_code=403, detail="MOD role required")
    if page < 1 or limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="Invalid pagination")
    try:
        async with request.app.state.database.connection() as connection:
            submissions, statistics = await InteractiveSubmissionService().list_for_mod(
                connection, event_id, UUID(str(claims["userId"])), status, page, limit
            )
        return {"submissions": submissions, "statistics": statistics}
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=403, detail=str(error)) from error
