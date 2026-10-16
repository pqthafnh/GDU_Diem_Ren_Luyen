"""Password and JWT security primitives."""

import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from typing import Final
from uuid import UUID

import bcrypt
import jwt

ALGORITHM: Final[str] = "HS256"


def hash_password(password: str) -> str:
    """Hash a password with bcrypt and return its UTF-8 encoded digest."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    """Compare a plaintext password to a bcrypt digest without leaking errors."""
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:
        return False


def create_access_token(
    user_id: UUID,
    role: str,
    email: str,
    secret: str,
    issuer: str,
    audience: str,
    expires_in_minutes: int,
) -> str:
    """Create a signed access token containing the canonical camelCase claims."""
    now = datetime.now(UTC)
    payload = {
        "userId": str(user_id),
        "role": role,
        "email": email,
        "typ": "access",
        "iss": issuer,
        "aud": audience,
        "iat": now,
        "exp": now + timedelta(minutes=expires_in_minutes),
    }
    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def decode_access_token(token: str, secret: str, issuer: str, audience: str) -> dict[str, object]:
    """Validate and decode an access token, raising PyJWT errors on invalid input."""
    return jwt.decode(token, secret, algorithms=[ALGORITHM], issuer=issuer, audience=audience)


def create_qr_token(
    event_id: UUID, secret: str, issuer: str, audience: str, ttl_seconds: int
) -> str:
    """Create a short-lived QR token bound to one event."""
    now = datetime.now(UTC)
    return jwt.encode(
        {
            "eventId": str(event_id),
            "typ": "eventQr",
            "iss": issuer,
            "aud": audience,
            "iat": now,
            "exp": now + timedelta(seconds=ttl_seconds),
        },
        secret,
        algorithm=ALGORITHM,
    )


def generate_otp() -> str:
    """Generate a cryptographically secure six-digit OTP."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(otp: str, secret: str) -> str:
    """Return an HMAC-SHA256 digest for an OTP without storing plaintext."""
    return hmac.new(secret.encode(), otp.encode(), hashlib.sha256).hexdigest()


def verify_otp(otp: str, expected_hash: str, secret: str) -> bool:
    """Compare an OTP digest in constant time."""
    return hmac.compare_digest(hash_otp(otp, secret), expected_hash)
