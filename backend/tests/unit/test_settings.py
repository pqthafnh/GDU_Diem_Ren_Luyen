"""Runtime settings safety tests."""

import pytest
from pydantic import ValidationError

from app.config.settings import Settings


def test_production_settings_reject_development_secrets() -> None:
    """Production settings require distinct, sufficiently long secrets."""
    with pytest.raises(ValidationError):
        Settings(
            app_env="production",
            jwt_secret="development-jwt-secret",
            jwt_qr_secret="development-qr-secret",
            otp_secret="development-otp-secret",
        )


def test_production_settings_reject_test_otp_exposure() -> None:
    """Production settings cannot expose OTP values to API responses."""
    with pytest.raises(ValidationError):
        Settings(
            app_env="production",
            jwt_secret="a" * 32,
            jwt_qr_secret="b" * 32,
            otp_secret="c" * 32,
            expose_test_otp=True,
        )
