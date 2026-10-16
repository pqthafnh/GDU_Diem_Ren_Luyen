"""HTTP adapters for student training points."""

from fastapi import APIRouter, Depends, HTTPException, Request

from app.modules.training_points.schemas import TrainingPointsResponse
from app.modules.training_points.service import TrainingPointsService
from app.shared.auth import current_claims

router = APIRouter(tags=["training-points"])


@router.get("", response_model=TrainingPointsResponse)
async def student_points(
    request: Request,
    semester: str | None = None,
    academic_year: str | None = None,
    claims: dict[str, object] = Depends(current_claims),
) -> TrainingPointsResponse:
    """Return the authenticated student's cumulative and filtered points."""
    if claims.get("role") != "STUDENT":
        raise HTTPException(status_code=403, detail="STUDENT role required")
    try:
        from uuid import UUID

        student_id = UUID(str(claims["userId"]))
        async with request.app.state.database.connection() as connection:
            return await TrainingPointsService().get_student_points(
                connection, student_id, semester, academic_year
            )
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=401, detail="Invalid authentication claims") from error
