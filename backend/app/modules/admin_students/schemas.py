"""Schemas for administrative student directory operations."""

from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class StudentCreate(BaseModel):
    """Validated data required to create one student account."""

    model_config = ConfigDict(populate_by_name=True)

    student_id: str = Field(
        alias="studentId", min_length=4, max_length=50, pattern=r"^[0-9A-Za-z-]+$"
    )
    full_name: str = Field(alias="fullName", min_length=2, max_length=150)
    email: EmailStr
    initial_password: str = Field(alias="initialPassword", min_length=8, max_length=128)
    gender: str = Field(default="Khác", min_length=1, max_length=10)
    birth_date: date = Field(alias="birthDate")
    class_name: str | None = Field(default=None, alias="className", max_length=50)
    major: str | None = Field(default=None, max_length=100)
    phone_number: str | None = Field(default=None, alias="phoneNumber", max_length=15)
    enrollment_year: int = Field(alias="enrollmentYear", ge=2000, le=2100)

    @field_validator("full_name", "student_id", "email", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        """Trim user-entered identity fields before validation."""
        return value.strip() if isinstance(value, str) else value


class StudentResponse(BaseModel):
    """Student account returned by the admin directory."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    id: UUID
    student_id: str = Field(alias="studentId")
    full_name: str = Field(alias="fullName")
    email: EmailStr
    gender: str
    birth_date: date = Field(alias="birthDate")
    class_name: str | None = Field(alias="className")
    major: str | None
    phone_number: str | None = Field(alias="phoneNumber")
    enrollment_year: int = Field(alias="enrollmentYear")
    created_at: str = Field(alias="createdAt")


class StudentYearGroup(BaseModel):
    """Student count grouped by enrollment year."""

    enrollment_year: int = Field(alias="enrollmentYear")
    count: int


class StudentDirectoryResponse(BaseModel):
    """Paginated student directory and year summaries."""

    students: list[StudentResponse]
    years: list[StudentYearGroup]
    total: int
    page: int
    limit: int


class DeleteResult(BaseModel):
    """Result of a student deletion operation."""

    deleted_count: int = Field(alias="deletedCount")
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class StaffCreate(BaseModel):
    """Validated data required to create an ADMIN or MOD account."""

    model_config = ConfigDict(populate_by_name=True)

    full_name: str = Field(alias="fullName", min_length=2, max_length=150)
    email: EmailStr
    initial_password: str = Field(alias="initialPassword", min_length=8, max_length=128)
    role: str = Field(pattern=r"^(ADMIN|MOD)$")
    gender: str = Field(default="Khác", min_length=1, max_length=10)
    birth_date: date = Field(alias="birthDate")
    phone_number: str | None = Field(default=None, alias="phoneNumber", max_length=15)

    @field_validator("full_name", "email", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object:
        """Trim staff identity fields before validation."""
        return value.strip() if isinstance(value, str) else value


class StaffResponse(BaseModel):
    """Staff account returned by the administrator directory."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    id: UUID
    full_name: str = Field(alias="fullName")
    email: EmailStr
    role: str
    gender: str
    birth_date: date = Field(alias="birthDate")
    phone_number: str | None = Field(alias="phoneNumber")
    created_at: str = Field(alias="createdAt")


class StaffDirectoryResponse(BaseModel):
    """Paginated ADMIN and MOD account directory."""

    staff: list[StaffResponse]
    total: int
    page: int
    limit: int
