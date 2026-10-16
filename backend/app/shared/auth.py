"""Reusable JWT authentication and role authorization dependencies."""

from collections.abc import Callable, Coroutine
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError

from app.config.settings import get_settings
from app.shared.security import decode_access_token

bearer = HTTPBearer(auto_error=False)
ClaimsDependency = Callable[
    [HTTPAuthorizationCredentials | None], Coroutine[object, object, dict[str, object]]
]


async def current_claims(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict[str, object]:
    """Validate the bearer token and return its claims."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required"
        )
    settings = get_settings()
    try:
        claims = decode_access_token(
            credentials.credentials, settings.jwt_secret, settings.jwt_issuer, settings.jwt_audience
        )
        if claims.get("typ") != "access":
            raise InvalidTokenError("Invalid access token type")
        request.state.claims = claims
        return claims
    except InvalidTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token"
        ) from error


def require_role(*roles: str) -> Callable[..., Coroutine[object, object, dict[str, object]]]:
    """Build a dependency that authorizes one of the supplied roles."""

    async def dependency(
        claims: Annotated[dict[str, object], Depends(current_claims)],
    ) -> dict[str, object]:
        if claims.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions"
            )
        return claims

    return dependency
