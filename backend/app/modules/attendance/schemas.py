"""Attendance API schemas."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CheckInRequest(BaseModel):
    """Client payload for a QR/GPS check-in."""

    qr_token: str = Field(alias="qrToken", min_length=1)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class CheckInResponse(BaseModel):
    """Successful attendance result."""

    success: bool
    status: str
    distance_meters: float = Field(alias="distanceMeters")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class ManualCheckInRequest(BaseModel):
    """MOD-selected students for extracurricular check-in."""

    student_ids: list[UUID] = Field(alias="studentIds", min_length=1)
    note: str | None = None
    model_config = ConfigDict(populate_by_name=True)


class ManualCheckOutRequest(BaseModel):
    """MOD-selected students for extracurricular check-out."""

    checked_out_student_ids: list[UUID] = Field(alias="checkedOutStudentIds", min_length=1)
    note: str | None = None
    model_config = ConfigDict(populate_by_name=True)


class CallStatusRequest(BaseModel):
    """MOD call outcome for a missing check-out."""

    student_id: UUID = Field(alias="studentId")
    call_status: str = Field(alias="callStatus", min_length=1)
    call_note: str | None = Field(default=None, alias="callNote")
    model_config = ConfigDict(populate_by_name=True)


class VerifiedCheckOutRequest(BaseModel):
    """Students confirmed safe after a follow-up call."""

    verified_student_ids: list[UUID] = Field(alias="verifiedStudentIds", min_length=1)
    verification_note: str | None = Field(default=None, alias="verificationNote")
    model_config = ConfigDict(populate_by_name=True)
