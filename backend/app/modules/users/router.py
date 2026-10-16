"""HTTP adapter for authenticated user preferences."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request

from app.config.settings import get_settings
from app.modules.auth.profile import SettingsUpdate
from app.modules.auth.service import AuthService
from app.shared.auth import current_claims

router = APIRouter(tags=["users"])


@router.patch("/settings")
async def update_settings(
    request: Request,
    body: SettingsUpdate,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """Persist the authenticated user's theme preference."""
    try:
        user_id = UUID(str(claims["userId"]))
        async with request.app.state.database.connection() as connection:
            theme = await AuthService(get_settings()).update_settings(connection, user_id, body)
        return {"success": True, "theme": theme}
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
