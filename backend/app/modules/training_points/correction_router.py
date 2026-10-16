"""HTTP adapter for authorized ledger corrections."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from app.modules.training_points.correction import LedgerCorrectionService
from app.shared.auth import current_claims

router = APIRouter(tags=["training-points"])


class CorrectionRequest(BaseModel):
    """Immutable ledger adjustment payload."""

    points: int = Field(ge=-100, le=100)
    reason: str = Field(min_length=1, max_length=500)
    idempotency_key: str = Field(alias="idempotencyKey", min_length=1, max_length=255)


@router.post("/corrections/{entry_id}", status_code=201)
async def correct(
    request: Request,
    entry_id: UUID,
    body: CorrectionRequest,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """Create one append-only adjustment as MOD or ADMIN."""
    if claims.get("role") not in {"MOD", "ADMIN"}:
        raise HTTPException(status_code=403, detail="MOD or ADMIN role required")
    try:
        actor_id = UUID(str(claims["userId"]))
        async with request.app.state.database.connection() as connection:
            correction_id = await LedgerCorrectionService().correct(
                connection, entry_id, actor_id, body.points, body.reason, body.idempotency_key
            )
        return {"success": True, "id": correction_id}
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
