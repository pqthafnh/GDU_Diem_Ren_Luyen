"""Ticket registration request and response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RegistrationRequest(BaseModel):
    """Validated student registration confirmation."""

    phone_number: str = Field(alias="phoneNumber", pattern=r"^0[35789]\d{8}$")
    confirm_correct: bool = Field(alias="confirmCorrect")
    note: str | None = None
    model_config = ConfigDict(populate_by_name=True)

    def validate_confirmation(self) -> None:
        """Require explicit confirmation of the review popup."""
        if not self.confirm_correct:
            raise ValueError("Student information must be confirmed")


class TicketResponse(BaseModel):
    """Ticket status returned after registration or cancellation."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
    id: UUID
    status: str
    queue_number: int = Field(alias="queueNumber")
    waitlist_position: int | None = Field(alias="waitlistPosition")
    seat_number: str | None = Field(alias="seatNumber")
    contact_phone: str = Field(alias="contactPhone")
    registered_at: datetime = Field(alias="registeredAt")


class TicketListResponse(TicketResponse):
    """Ticket with its event identifier for the student's ticket list."""

    event_id: UUID = Field(alias="eventId")
    event_title: str = Field(alias="eventTitle")
    cancelled_at: datetime | None = Field(alias="cancelledAt")
