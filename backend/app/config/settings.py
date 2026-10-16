"""Validated environment settings for the API."""

from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables or ``.env``."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="", extra="ignore")

    app_name: str = "GDU Event & Training API"
    app_env: str = "development"
    app_debug: bool = False
    app_host: str = "0.0.0.0"
    app_port: int = 4000
    database_url: str = "postgresql://gdu:gdu@localhost:5432/gdu_event_training"
    database_pool_min_size: int = Field(default=2, ge=1)
    database_pool_max_size: int = Field(default=10, ge=1)
    database_pool_timeout_seconds: float = Field(default=10.0, gt=0)
    jwt_secret: str = "development-jwt-secret"
    jwt_qr_secret: str = "development-qr-secret"
    jwt_expires_in_minutes: int = Field(default=1440, gt=0)
    jwt_issuer: str = "gdu-event-training"
    jwt_audience: str = "gdu-web"
    qr_token_ttl_seconds: int = Field(default=30, gt=0)
    otp_secret: str = "development-otp-secret"
    otp_ttl_minutes: int = Field(default=5, gt=0)
    otp_max_attempts: int = Field(default=5, ge=1)
    expose_test_otp: bool = False
    cors_origins: str = "http://localhost:3000"
    max_request_body_bytes: int = Field(default=2_000_000, ge=1024)
    auth_rate_limit_requests: int = Field(default=30, ge=1)
    auth_rate_limit_window_seconds: int = Field(default=60, ge=1)

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        """Reject development secrets and test OTP exposure in production."""
        if self.app_env.lower() != "production":
            return self
        secrets = {
            "JWT_SECRET": self.jwt_secret,
            "JWT_QR_SECRET": self.jwt_qr_secret,
            "OTP_SECRET": self.otp_secret,
        }
        if self.expose_test_otp:
            raise ValueError("EXPOSE_TEST_OTP must be disabled in production")
        if len(set(secrets.values())) != len(secrets):
            raise ValueError("JWT, QR, and OTP secrets must be distinct in production")
        if any(value.startswith("development-") or len(value) < 32 for value in secrets.values()):
            raise ValueError("Production secrets must be configured with at least 32 characters")
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        """Return comma-separated CORS origins as a normalized list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return the process-wide immutable settings object."""
    return Settings()
