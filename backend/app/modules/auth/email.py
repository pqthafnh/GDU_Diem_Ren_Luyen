"""Asynchronous SMTP delivery for first-login verification messages."""

import asyncio
import json
import logging
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from typing import Protocol

from app.config.settings import Settings

logger = logging.getLogger("gdu_event_training")


def _mask_recipient(email: str) -> str:
    """Mask email to preserve domain while keeping the local part opaque."""
    if "@" not in email:
        return "***"
    local, domain = email.split("@", 1)
    if not local:
        return f"***@{domain}"
    masked_local = f"{local[0]}***" if len(local) > 1 else "***"
    return f"{masked_local}@{domain}"


def _sanitize_message(
    message: str,
    *,
    otp: str,
    smtp_password: str | None,
    recipient: str,
) -> str:
    """Sanitize error messages to remove plain OTP, passwords, or full recipient email."""
    sanitized = message
    if otp and otp in sanitized:
        sanitized = sanitized.replace(otp, "[REDACTED_OTP]")
    if smtp_password and smtp_password in sanitized:
        sanitized = sanitized.replace(smtp_password, "[REDACTED_PASSWORD]")
    if recipient and recipient in sanitized:
        sanitized = sanitized.replace(recipient, _mask_recipient(recipient))
    return sanitized


class OtpEmailSender(Protocol):
    """Deliver a first-login OTP without exposing the OTP to callers or logs."""

    async def send_otp(self, recipient: str, otp: str, ttl_minutes: int) -> None:
        """Send one OTP email or raise an email delivery error."""


class EmailDeliveryError(Exception):
    """Raised when the configured SMTP server cannot accept the OTP email."""


@dataclass(frozen=True)
class OtpEmailTemplate:
    """Vietnamese first-login email content."""

    subject: str = "Mã OTP kích hoạt tài khoản GDU"

    def render(self, otp: str, ttl_minutes: int) -> str:
        """Render a message that contains no password or authentication secret."""
        return (
            "Xin chào,\n\n"
            "Mã OTP để hoàn tất kích hoạt tài khoản GDU của bạn là:\n\n"
            f"{otp}\n\n"
            f"Mã có hiệu lực trong {ttl_minutes} phút.\n"
            "Không chia sẻ mã OTP này với bất kỳ ai. GDU sẽ không yêu cầu bạn cung cấp "
            "mật khẩu hoặc mã OTP qua email, điện thoại hay tin nhắn.\n\n"
            "Nếu bạn không thực hiện yêu cầu này, hãy liên hệ bộ phận hỗ trợ của nhà trường."
        )


class SmtpOtpEmailSender:
    """Send OTP messages through SMTP without blocking the asyncio event loop."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._template = OtpEmailTemplate()

    async def send_otp(self, recipient: str, otp: str, ttl_minutes: int) -> None:
        """Send an OTP using STARTTLS on port 587 and a bounded network timeout."""
        if not self._settings.smtp_host or not self._settings.smtp_from:
            raise EmailDeliveryError("OTP email service is not configured")
        try:
            await asyncio.to_thread(self._send_blocking, recipient, otp, ttl_minutes)
        except EmailDeliveryError:
            raise
        except (OSError, smtplib.SMTPException) as error:
            self._log_delivery_failure(error, recipient, otp)
            raise EmailDeliveryError("OTP email delivery failed") from error

    def _log_delivery_failure(
        self,
        error: BaseException,
        recipient: str,
        otp: str,
    ) -> None:
        """Emit structured diagnostic logs without exposing credentials or recipient identity."""
        exception_class = type(error).__name__
        smtp_password = self._settings.smtp_password
        masked_recipient = _mask_recipient(recipient)

        log_data: dict[str, object] = {
            "event": "smtp_otp_delivery_failed",
            "exceptionClass": exception_class,
            "recipient": masked_recipient,
        }

        smtp_code = getattr(error, "smtp_code", None)
        if isinstance(smtp_code, int):
            log_data["smtpCode"] = smtp_code

        if isinstance(error, smtplib.SMTPAuthenticationError):
            raw_smtp_error = getattr(error, "smtp_error", b"")
            if isinstance(raw_smtp_error, bytes):
                decoded_error = raw_smtp_error.decode("utf-8", errors="replace")
            else:
                decoded_error = str(raw_smtp_error)
            log_data["smtpError"] = _sanitize_message(
                decoded_error,
                otp=otp,
                smtp_password=smtp_password,
                recipient=recipient,
            )

        raw_message = str(error)
        if raw_message:
            log_data["message"] = _sanitize_message(
                raw_message,
                otp=otp,
                smtp_password=smtp_password,
                recipient=recipient,
            )

        logger.error(json.dumps(log_data, default=str))

    def _send_blocking(self, recipient: str, otp: str, ttl_minutes: int) -> None:
        smtp_host = self._settings.smtp_host
        smtp_from = self._settings.smtp_from
        if not smtp_host or not smtp_from:
            raise EmailDeliveryError("OTP email service is not configured")

        message = EmailMessage()
        message["Subject"] = self._template.subject
        message["From"] = smtp_from
        message["To"] = recipient
        message.set_content(self._template.render(otp, ttl_minutes))

        smtp: smtplib.SMTP
        if self._settings.smtp_port == 587:
            smtp = smtplib.SMTP(
                smtp_host,
                self._settings.smtp_port,
                timeout=self._settings.smtp_timeout_seconds,
            )
        elif self._settings.smtp_secure:
            smtp = smtplib.SMTP_SSL(
                smtp_host,
                self._settings.smtp_port,
                timeout=self._settings.smtp_timeout_seconds,
            )
        else:
            smtp = smtplib.SMTP(
                smtp_host,
                self._settings.smtp_port,
                timeout=self._settings.smtp_timeout_seconds,
            )
        with smtp:
            if self._settings.smtp_port == 587:
                smtp.starttls()
            if self._settings.smtp_user and self._settings.smtp_password:
                smtp.login(self._settings.smtp_user, self._settings.smtp_password)
            smtp.send_message(message)
