"""HTTP adapters for authentication and first-login activation."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.config.settings import get_settings
from app.modules.auth.email import EmailDeliveryError
from app.modules.auth.profile import ProfileResponse
from app.modules.auth.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    VerifyOtpRequest,
)
from app.modules.auth.service import AuthService
from app.shared.auth import current_claims

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(request: Request, body: LoginRequest) -> LoginResponse:
    """Authenticate a student or staff account."""
    database = request.app.state.database
    try:
        async with database.connection() as connection:
            return await AuthService(get_settings()).login(connection, body)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error)) from error


@router.post("/first-login/change-password")
async def change_password(request: Request, body: ChangePasswordRequest) -> dict[str, object]:
    """Create a pending first-login password and deliver its OTP."""
    try:
        async with request.app.state.database.connection() as connection:
            email, test_otp = await AuthService(
                get_settings(), request.app.state.email_sender
            ).change_first_password(connection, body)
        response: dict[str, object] = {
            "success": True,
            "message": "A verification OTP was sent to the school email.",
            "schoolEmail": email,
        }
        if test_otp is not None:
            response["testOtp"] = test_otp
        return response
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except EmailDeliveryError as error:
        raise HTTPException(
            status_code=503,
            detail={"code": "OTP_EMAIL_DELIVERY_FAILED", "message": str(error), "details": []},
        ) from error


@router.post("/first-login/verify-otp", response_model=LoginResponse)
async def verify_first_otp(request: Request, body: VerifyOtpRequest) -> LoginResponse:
    """Verify the first-login OTP and activate the pending password."""
    try:
        async with request.app.state.database.connection() as connection:
            return await AuthService(get_settings()).verify_first_otp(connection, body)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get("/me", response_model=ProfileResponse)
async def me(
    request: Request, claims: dict[str, object] = Depends(current_claims)
) -> ProfileResponse:
    """Return the authenticated profile and cumulative points classification."""
    try:
        user_id = UUID(str(claims["userId"]))
        async with request.app.state.database.connection() as connection:
            return await AuthService(get_settings()).profile(connection, user_id)
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=401, detail="Invalid user identity") from error
