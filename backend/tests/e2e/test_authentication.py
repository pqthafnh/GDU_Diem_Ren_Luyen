"""End-to-end authentication and JWT contract tests."""

from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import httpx
import jwt
import pytest
from httpx import AsyncClient

from app.config.settings import Settings, get_settings
from app.database.pool import Database
from app.main import create_app
from app.modules.auth.email import EmailDeliveryError, SmtpOtpEmailSender
from app.shared.security import create_access_token, hash_password


async def _create_first_login_user(database: Database) -> tuple[str, str]:
    """Create a first-login user and return its student ID and database ID."""
    student_id = f"first-{uuid4().hex[:10]}"
    async with database.connection() as connection:
        async with connection.transaction():
            cursor = await connection.execute(
                """INSERT INTO users
                   (student_id, last_name, first_name, full_name, birth_date, email,
                    password_hash, is_password_changed, role)
                   VALUES (%s, 'Test', 'First', 'Test First', '2000-01-01',
                           %s, %s, FALSE, 'STUDENT')
                   RETURNING id""",
                (student_id, f"{student_id}@test.gdu.edu.vn", hash_password("Default@123")),
            )
            row = await cursor.fetchone()
            if row is None:
                raise RuntimeError("First-login user was not created")
    return student_id, str(row[0])


@pytest.mark.asyncio
async def test_first_login_otp_activation_and_database_cleanup(
    client: AsyncClient, database: Database
) -> None:
    """Verify first-login password replacement, OTP gating, and cleanup."""
    settings = get_settings()
    settings.expose_test_otp = True
    student_id, user_id = await _create_first_login_user(database)

    initial = await client.post(
        "/api/auth/login", json={"studentId": student_id, "password": "Default@123"}
    )
    assert initial.status_code == 200
    assert initial.json()["requirePasswordChange"] is True

    changed = await client.post(
        "/api/auth/first-login/change-password",
        json={
            "studentId": student_id,
            "newPassword": "NewPassword@123",
            "confirmPassword": "NewPassword@123",
        },
    )
    assert changed.status_code == 200
    otp = changed.json()["testOtp"]

    pending_login = await client.post(
        "/api/auth/login", json={"studentId": student_id, "password": "NewPassword@123"}
    )
    assert pending_login.status_code == 401

    wrong = await client.post(
        "/api/auth/first-login/verify-otp",
        json={"studentId": student_id, "otp": "000000"},
    )
    assert wrong.status_code == 400
    async with database.connection() as connection:
        row = await connection.execute(
            "SELECT pending_password_hash, otp_hash, otp_expires_at, otp_attempts, "
            "is_password_changed FROM users WHERE id = %s",
            (user_id,),
        )
        state = await row.fetchone()
    assert state is not None
    assert state[0] is not None and state[1] is not None
    assert state[3] == 1 and state[4] is False

    verified = await client.post(
        "/api/auth/first-login/verify-otp",
        json={"studentId": student_id, "otp": otp},
    )
    assert verified.status_code == 200
    assert verified.json()["accessToken"]
    async with database.connection() as connection:
        row = await connection.execute(
            "SELECT pending_password_hash, otp_hash, otp_expires_at, otp_attempts, "
            "is_password_changed FROM users WHERE id = %s",
            (user_id,),
        )
        state = await row.fetchone()
    assert state == (None, None, None, 0, True)

    old_login = await client.post(
        "/api/auth/login", json={"studentId": student_id, "password": "Default@123"}
    )
    assert old_login.status_code == 401
    new_login = await client.post(
        "/api/auth/login", json={"studentId": student_id, "password": "NewPassword@123"}
    )
    assert new_login.status_code == 200


@pytest.mark.asyncio
async def test_jwt_issuer_audience_and_type_are_enforced(
    client: AsyncClient, seeded_users: dict[str, UUID]
) -> None:
    """Reject access tokens with invalid issuer, audience, or token type."""
    settings = get_settings()
    user_id = seeded_users["STUDENT"]
    cases = (
        create_access_token(
            user_id,
            "STUDENT",
            "student@test.gdu.edu.vn",
            settings.jwt_secret,
            "wrong-issuer",
            settings.jwt_audience,
            60,
        ),
        create_access_token(
            user_id,
            "STUDENT",
            "student@test.gdu.edu.vn",
            settings.jwt_secret,
            settings.jwt_issuer,
            "wrong-audience",
            60,
        ),
    )
    for token in cases:
        response = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 401

    expired = create_access_token(
        user_id,
        "STUDENT",
        "student@test.gdu.edu.vn",
        settings.jwt_secret,
        settings.jwt_issuer,
        settings.jwt_audience,
        -1,
    )
    response = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired}"})
    assert response.status_code == 401

    wrong_type = jwt.encode(
        {
            "userId": str(user_id),
            "role": "STUDENT",
            "email": "student@test.gdu.edu.vn",
            "typ": "eventQr",
            "iss": settings.jwt_issuer,
            "aud": settings.jwt_audience,
            "iat": datetime.now(UTC),
            "exp": datetime.now(UTC) + timedelta(minutes=5),
        },
        settings.jwt_secret,
        algorithm="HS256",
    )
    response = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {wrong_type}"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_first_login_email_delivery_failure_returns_503_and_rolls_back(
    database: Database,
) -> None:
    """When OTP email delivery fails, return canonical 503 and rollback pending state."""
    student_id, user_id = await _create_first_login_user(database)

    class FailingSender:
        async def send_otp(self, recipient: str, otp: str, ttl_minutes: int) -> None:
            raise EmailDeliveryError("SMTP connection timed out")

    app = create_app()
    app.state.database = database
    app.state.email_sender = FailingSender()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as custom_client:
        response = await custom_client.post(
            "/api/auth/first-login/change-password",
            json={
                "studentId": student_id,
                "newPassword": "NewPassword@123",
                "confirmPassword": "NewPassword@123",
            },
        )
    assert response.status_code == 503
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "OTP_EMAIL_DELIVERY_FAILED"
    assert "SMTP connection timed out" in body["error"]["message"]
    assert body["error"]["requestId"] == response.headers["X-Request-ID"]

    async with database.connection() as connection:
        cursor = await connection.execute(
            "SELECT pending_password_hash, otp_hash, otp_expires_at, is_password_changed "
            "FROM users WHERE id = %s",
            (user_id,),
        )
        state = await cursor.fetchone()
    assert state == (None, None, None, False)


@pytest.mark.asyncio
async def test_first_login_unconfigured_smtp_returns_503(
    database: Database,
) -> None:
    """When SMTP settings are missing, return 503 without committing credentials."""
    student_id, user_id = await _create_first_login_user(database)

    app = create_app()
    app.state.database = database
    app.state.email_sender = SmtpOtpEmailSender(Settings(smtp_host=None, smtp_from=None))
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as custom_client:
        response = await custom_client.post(
            "/api/auth/first-login/change-password",
            json={
                "studentId": student_id,
                "newPassword": "NewPassword@123",
                "confirmPassword": "NewPassword@123",
            },
        )
    assert response.status_code == 503
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "OTP_EMAIL_DELIVERY_FAILED"
    assert "OTP email service is not configured" in body["error"]["message"]
    assert body["error"]["requestId"] == response.headers["X-Request-ID"]

    async with database.connection() as connection:
        cursor = await connection.execute(
            "SELECT pending_password_hash, otp_hash, otp_expires_at, is_password_changed "
            "FROM users WHERE id = %s",
            (user_id,),
        )
        state = await cursor.fetchone()
    assert state == (None, None, None, False)
