"""Pydantic event request and response schemas."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class EventCreate(BaseModel):
    """Validated event draft payload."""

    model_config = ConfigDict(populate_by_name=True)
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    category: str = Field(min_length=1, max_length=50)
    event_type: Literal["STANDARD", "INTERACTIVE"] = Field(default="STANDARD", alias="eventType")
    check_in_method: Literal["QR_GPS", "MANUAL_ROLLCALL", "SOCIAL_INTERACTIVE"] = Field(
        default="QR_GPS", alias="checkInMethod"
    )
    start_time: datetime = Field(alias="startTime")
    end_time: datetime = Field(alias="endTime")
    location_name: str = Field(alias="locationName", min_length=1, max_length=255)
    gps_lat: float | None = Field(default=None, alias="gpsLat", ge=-90, le=90)
    gps_lng: float | None = Field(default=None, alias="gpsLng", ge=-180, le=180)
    capacity: int | None = Field(default=None, gt=0)
    points_reward: int = Field(default=0, alias="pointsReward", ge=0)

    @model_validator(mode="after")
    def validate_business_rules(self) -> "EventCreate":
        """Enforce event-type-specific required fields."""
        if self.start_time >= self.end_time:
            raise ValueError("startTime must be before endTime")
        if self.event_type == "STANDARD" and (
            self.capacity is None or self.gps_lat is None or self.gps_lng is None
        ):
            raise ValueError("STANDARD events require capacity and GPS coordinates")
        if self.event_type == "INTERACTIVE" and self.capacity is not None:
            raise ValueError("INTERACTIVE events do not use tickets")
        return self


class EventResponse(BaseModel):
    """Public event representation."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
    id: UUID
    title: str
    description: str
    category: str
    event_type: str = Field(alias="eventType")
    status: str
    start_time: datetime = Field(alias="startTime")
    end_time: datetime = Field(alias="endTime")
    location_name: str = Field(alias="locationName")
    capacity: int | None
    points_reward: int = Field(alias="pointsReward")


class ReviewDecision(BaseModel):
    """Admin decision over a pending event."""

    action: Literal["APPROVE", "REJECT", "REQUEST_CHANGE"]
    feedback: str | None = None


class EventListItem(BaseModel):
    """Event summary returned by public and administrative listings."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)
    id: UUID
    title: str
    category: str
    event_type: str = Field(alias="eventType")
    status: str
    start_time: datetime = Field(alias="startTime")
    end_time: datetime = Field(alias="endTime")
    location_name: str = Field(alias="locationName")
    capacity: int | None
    registered_count: int = Field(alias="registeredCount")
    points_reward: int = Field(alias="pointsReward")
