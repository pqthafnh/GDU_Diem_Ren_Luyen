"""Pydantic schemas for authentication."""

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class LoginRequest(BaseModel):
    """Credentials accepted for either a student or staff account."""

    model_config = ConfigDict(populate_by_name=True)
    student_id: str | None = Field(default=None, alias="studentId", min_length=1)
    email: EmailStr | None = None
    password: str = Field(min_length=1)

    @model_validator(mode="after")
    def has_identity(self) -> "LoginRequest":
        """Require exactly one supported account identifier."""
        if bool(self.student_id) == bool(self.email):
            raise ValueError("Provide exactly one of studentId or email")
        return self


class UserResponse(BaseModel):
    """Safe user representation returned by the API."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
    id: str
    student_id: str | None = Field(alias="studentId")
    full_name: str = Field(alias="fullName")
    email: str
    role: str
    theme_preference: str = Field(alias="themePreference")


class LoginResponse(BaseModel):
    """Successful login response, including first-login state."""

    success: bool
    require_password_change: bool = Field(alias="requirePasswordChange")
    message: str
    access_token: str | None = Field(default=None, alias="accessToken")
    expires_in: int | None = Field(default=None, alias="expiresIn")
    user: UserResponse | None = None

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class ChangePasswordRequest(BaseModel):
    """First-login password replacement request."""

    student_id: str = Field(alias="studentId", min_length=1)
    new_password: str = Field(alias="newPassword", min_length=6)
    confirm_password: str = Field(alias="confirmPassword", min_length=6)

    model_config = ConfigDict(populate_by_name=True)


class VerifyOtpRequest(BaseModel):
    """OTP activation request."""

    student_id: str = Field(alias="studentId", min_length=1)
    otp: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")

    model_config = ConfigDict(populate_by_name=True)
