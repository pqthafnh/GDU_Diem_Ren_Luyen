"""Asynchronous SMTP delivery for first-login verification messages."""

import asyncio
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from typing import Protocol

from app.config.settings import Settings


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
            raise EmailDeliveryError("OTP email delivery failed") from error

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
