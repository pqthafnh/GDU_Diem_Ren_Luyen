"""Authenticated profile and settings schemas."""

from pydantic import BaseModel, ConfigDict, Field


class ProfileResponse(BaseModel):
    """Complete authenticated user profile with cumulative training points."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
    id: str
    student_id: str | None = Field(alias="studentId")
    last_name: str = Field(alias="lastName")
    first_name: str = Field(alias="firstName")
    full_name: str = Field(alias="fullName")
    gender: str
    birth_date: str = Field(alias="birthDate")
    class_name: str | None = Field(alias="className")
    major: str | None
    email: str
    role: str
    total_training_points: int = Field(alias="totalTrainingPoints")
    classification: str
    theme_preference: str = Field(alias="themePreference")


class SettingsUpdate(BaseModel):
    """Allowed user preference update."""

    theme: str
