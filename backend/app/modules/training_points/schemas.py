"""Training points API schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PointHistoryItem(BaseModel):
    """One immutable ledger entry."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
    id: UUID
    event_title: str | None = Field(alias="eventTitle")
    points: int
    category: str
    semester: str
    academic_year: str = Field(alias="academicYear")
    source_type: str = Field(alias="sourceType")
    correction_of: UUID | None = Field(alias="correctionOf")
    earned_at: datetime = Field(alias="earnedAt")


class TrainingPointsResponse(BaseModel):
    """Cumulative and filtered student points."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
    cumulative_total_3_years: int = Field(alias="cumulativeTotal3Years")
    classification: str
    filtered_total: int = Field(alias="filteredTotal")
    history: list[PointHistoryItem]
