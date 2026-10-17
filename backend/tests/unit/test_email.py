"""SMTP OTP delivery tests."""

import smtplib
from email.message import EmailMessage

import pytest

from app.config.settings import Settings
from app.modules.auth.email import EmailDeliveryError, OtpEmailTemplate, SmtpOtpEmailSender


def _settings(
    *,
    smtp_host: str | None = "smtp.example.test",
    smtp_from: str | None = "no-reply@example.test",
    smtp_user: str | None = "mailer@example.test",
    smtp_password: str | None = "smtp-secret",
    smtp_port: int = 587,
    smtp_secure: bool = False,
    smtp_timeout_seconds: float = 10.0,
) -> Settings:
    return Settings(
        smtp_host=smtp_host,
        smtp_from=smtp_from,
        smtp_user=smtp_user,
        smtp_password=smtp_password,
        smtp_port=smtp_port,
        smtp_secure=smtp_secure,
        smtp_timeout_seconds=smtp_timeout_seconds,
    )


@pytest.mark.asyncio
async def test_smtp_sender_uses_starttls_and_sends_message(monkeypatch: pytest.MonkeyPatch) -> None:
    """Configured SMTP sends a Vietnamese OTP message over STARTTLS."""
    sent: list[object] = []

    class FakeSmtp:
        def __init__(self, host: str, port: int, timeout: float) -> None:
            assert (host, port, timeout) == ("smtp.example.test", 587, 10.0)

        def __enter__(self) -> "FakeSmtp":
            return self

        def __exit__(self, *args: object) -> None:
            return None

        def starttls(self) -> None:
            sent.append("starttls")

        def login(self, username: str, password: str) -> None:
            assert username == "mailer@example.test"
            assert password == "smtp-secret"
            sent.append("login")

        def send_message(self, message: object) -> None:
            sent.append(message)

    monkeypatch.setattr("app.modules.auth.email.smtplib.SMTP", FakeSmtp)
    await SmtpOtpEmailSender(_settings()).send_otp("student@example.test", "123456", 5)

    assert sent[:2] == ["starttls", "login"]
    raw_message = sent[2]
    assert isinstance(raw_message, EmailMessage)
    assert raw_message["To"] == "student@example.test"
    assert "123456" in raw_message.get_content()
    assert "mật khẩu" in raw_message.get_content()


@pytest.mark.asyncio
async def test_smtp_sender_rejects_missing_production_configuration() -> None:
    """A missing SMTP host fails instead of producing a success-shaped response."""
    with pytest.raises(EmailDeliveryError, match="not configured"):
        await SmtpOtpEmailSender(_settings(smtp_host=None)).send_otp(
            "student@example.test", "123456", 5
        )


@pytest.mark.asyncio
@pytest.mark.parametrize("error", [smtplib.SMTPAuthenticationError(535, b"denied"), TimeoutError()])
async def test_smtp_sender_normalizes_authentication_and_timeout_errors(
    monkeypatch: pytest.MonkeyPatch, error: BaseException
) -> None:
    """SMTP authentication and timeout failures are safe delivery errors."""

    class FailingSmtp:
        def __init__(self, *args: object, **kwargs: object) -> None:
            raise error

    monkeypatch.setattr("app.modules.auth.email.smtplib.SMTP", FailingSmtp)
    with pytest.raises(EmailDeliveryError, match="delivery failed"):
        await SmtpOtpEmailSender(_settings()).send_otp("student@example.test", "123456", 5)


def test_otp_template_contains_no_password() -> None:
    """The user-facing template contains OTP safety guidance, not a password."""
    body = OtpEmailTemplate().render("123456", 5)
    assert "123456" in body
    assert "5 phút" in body
    assert "Không chia sẻ" in body
    assert "password" not in body.lower()


@pytest.mark.asyncio
async def test_smtp_auth_error_logs_diagnostics_without_sensitive_data(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """Authentication errors log decoded response details while redacting secrets and recipient."""
    otp = "654321"
    password = "super-secret-smtp-password"
    recipient = "student@example.test"
    settings = _settings(smtp_password=password)

    class FailingAuthSmtp:
        def __init__(self, *args: object, **kwargs: object) -> None:
            raise smtplib.SMTPAuthenticationError(535, b"5.7.8 Authentication failed")

    monkeypatch.setattr("app.modules.auth.email.smtplib.SMTP", FailingAuthSmtp)

    with caplog.at_level("ERROR", logger="gdu_event_training"):
        with pytest.raises(EmailDeliveryError, match="delivery failed"):
            await SmtpOtpEmailSender(settings).send_otp(recipient, otp, 5)

    assert "SMTPAuthenticationError" in caplog.text
    assert "535" in caplog.text
    assert "Authentication failed" in caplog.text
    assert "s***@example.test" in caplog.text
    assert recipient not in caplog.text
    assert otp not in caplog.text
    assert password not in caplog.text


@pytest.mark.asyncio
async def test_smtp_timeout_logs_exception_class_without_sensitive_data(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """Timeout errors log the TimeoutError class name while redacting secrets."""
    otp = "987654"
    password = "secret-timeout-password"
    recipient = "user@school.edu.vn"
    settings = _settings(smtp_password=password)

    class TimeoutSmtp:
        def __init__(self, *args: object, **kwargs: object) -> None:
            raise TimeoutError("timed out connecting to host")

    monkeypatch.setattr("app.modules.auth.email.smtplib.SMTP", TimeoutSmtp)

    with caplog.at_level("ERROR", logger="gdu_event_training"):
        with pytest.raises(EmailDeliveryError, match="delivery failed"):
            await SmtpOtpEmailSender(settings).send_otp(recipient, otp, 5)

    assert "TimeoutError" in caplog.text
    assert "u***@school.edu.vn" in caplog.text
    assert recipient not in caplog.text
    assert otp not in caplog.text
    assert password not in caplog.text


@pytest.mark.asyncio
async def test_smtp_error_message_containing_secrets_is_sanitized(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """Raw exceptions embedding secrets or recipient emails are sanitized before logging."""
    otp = "112233"
    password = "leaked-secret-password"
    recipient = "victim@school.edu.vn"
    settings = _settings(smtp_password=password)

    class LeakSmtp:
        def __init__(self, *args: object, **kwargs: object) -> None:
            raise smtplib.SMTPException(f"Error with pass {password} and otp {otp} for {recipient}")

    monkeypatch.setattr("app.modules.auth.email.smtplib.SMTP", LeakSmtp)

    with caplog.at_level("ERROR", logger="gdu_event_training"):
        with pytest.raises(EmailDeliveryError, match="delivery failed"):
            await SmtpOtpEmailSender(settings).send_otp(recipient, otp, 5)

    assert otp not in caplog.text
    assert password not in caplog.text
    assert recipient not in caplog.text
    assert "[REDACTED_OTP]" in caplog.text
    assert "[REDACTED_PASSWORD]" in caplog.text
    assert "v***@school.edu.vn" in caplog.text
