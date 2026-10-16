"""Unit tests for canonical training point classification."""

import pytest

from app.modules.training_points.service import classify_points


@pytest.mark.parametrize(
    ("total", "expected"),
    [
        (100, "Xuất sắc"),
        (90, "Xuất sắc"),
        (89, "Giỏi"),
        (80, "Giỏi"),
        (79, "Khá"),
        (65, "Khá"),
        (64, "Trung bình"),
        (50, "Trung bình"),
        (49, "Yếu"),
        (35, "Yếu"),
        (34, "Kém"),
        (0, "Kém"),
    ],
)
def test_classification_boundaries(total: int, expected: str) -> None:
    """Every classification boundary maps to its canonical label."""
    assert classify_points(total) == expected
