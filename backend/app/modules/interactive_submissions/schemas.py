"""Interactive submission request and response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field


class SubmissionRequest(BaseModel):
    """Student proof payload."""

    facebook_proof_url: AnyHttpUrl = Field(alias="facebookProofUrl")
    completed_action_ids: list[str] = Field(alias="completedActionIds", min_length=1)
    model_config = ConfigDict(populate_by_name=True)


class VerifySubmissionRequest(BaseModel):
    """MOD decision for a proof submission."""

    status: str
    points_awarded: int = Field(alias="pointsAwarded", ge=0, le=3)
    note: str | None = None
    model_config = ConfigDict(populate_by_name=True)


class SubmissionResponse(BaseModel):
    """Submission status returned to a student or MOD."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
    id: UUID
    event_id: UUID = Field(alias="eventId")
    status: str
    facebook_proof_url: str = Field(alias="facebookProofUrl")
    completed_actions_count: int = Field(alias="completedActionsCount")
    points_awarded: int = Field(alias="pointsAwarded")
    submitted_at: datetime = Field(alias="submittedAt")


class SubmissionItem(SubmissionResponse):
    """Submission row enriched with student identity and submitted actions."""

    student_id: UUID = Field(alias="studentId")
    student_name: str = Field(alias="studentName")
    completed_action_ids: list[str] = Field(alias="completedActionIds")
    note: str | None = None


class SubmissionStatistics(BaseModel):
    """Aggregated submission counts for one interactive event."""

    total: int
    pending: int
    approved: int
    rejected: int
    total_points_awarded: int = Field(alias="totalPointsAwarded")
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
