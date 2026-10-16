from datetime import UTC, datetime, timedelta

import pytest
from pydantic import ValidationError

from app.modules.events.schemas import EventCreate


def test_standard_event_requires_capacity_and_gps() -> None:
    with pytest.raises(ValidationError):
        EventCreate(
            title="Talk",
            description="Desc",
            category="Academic",
            startTime=datetime.now(UTC),
            endTime=datetime.now(UTC) + timedelta(hours=1),
            locationName="Hall",
        )


def test_interactive_event_does_not_use_capacity() -> None:
    with pytest.raises(ValidationError):
        EventCreate(
            title="Social",
            description="Desc",
            category="Interactive",
            eventType="INTERACTIVE",
            startTime=datetime.now(UTC),
            endTime=datetime.now(UTC) + timedelta(hours=1),
            locationName="Online",
            capacity=10,
        )
