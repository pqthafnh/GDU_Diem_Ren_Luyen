"""Email delivery adapters for first-login verification messages."""

import asyncio
import json
import logging
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from typing import Protocol

import httpx

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
    recipient: str,
    smtp_password: str | None = None,
    api_key: str | None = None,
) -> str:
    """Sanitize error messages to remove plain OTP, passwords, API keys, or full recipient email."""
    sanitized = message
    if otp and otp in sanitized:
        sanitized = sanitized.replace(otp, "[REDACTED_OTP]")
    if smtp_password and smtp_password in sanitized:
        sanitized = sanitized.replace(smtp_password, "[REDACTED_PASSWORD]")
    if api_key and api_key in sanitized:
        sanitized = sanitized.replace(api_key, "[REDACTED_API_KEY]")
    if recipient and recipient in sanitized:
        sanitized = sanitized.replace(recipient, _mask_recipient(recipient))
    return sanitized


class OtpEmailSender(Protocol):
    """Deliver a first-login OTP without exposing the OTP to callers or logs."""

    async def send_otp(self, recipient: str, otp: str, ttl_minutes: int) -> None:
        """Send one OTP email or raise an email delivery error."""


class EmailDeliveryError(Exception):
    """Raised when the configured email service cannot accept or deliver the OTP email."""


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
        if not self._settings.smtp_host or not self._settings.sender_email:
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
        smtp_from = self._settings.sender_email
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


class ResendOtpEmailSender:
    """Send OTP messages through Resend HTTPS API asynchronously."""

    RESEND_API_URL = "https://api.resend.com/emails"

    def __init__(self, settings: Settings, client: httpx.AsyncClient | None = None) -> None:
        self._settings = settings
        self._client = client
        self._template = OtpEmailTemplate()

    async def send_otp(self, recipient: str, otp: str, ttl_minutes: int) -> None:
        """Deliver OTP through Resend REST API."""
        api_key = self._settings.resend_api_key
        sender_email = self._settings.sender_email
        if not api_key or not sender_email:
            raise EmailDeliveryError("OTP email service is not configured")

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "from": sender_email,
            "to": [recipient],
            "subject": self._template.subject,
            "text": self._template.render(otp, ttl_minutes),
        }

        try:
            if self._client is not None:
                response = await self._client.post(
                    self.RESEND_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=self._settings.smtp_timeout_seconds,
                )
                self._handle_response(response, recipient=recipient, otp=otp, api_key=api_key)
            else:
                async with httpx.AsyncClient(timeout=self._settings.smtp_timeout_seconds) as client:
                    response = await client.post(
                        self.RESEND_API_URL,
                        headers=headers,
                        json=payload,
                    )
                    self._handle_response(response, recipient=recipient, otp=otp, api_key=api_key)
        except EmailDeliveryError:
            raise
        except (httpx.HTTPError, TimeoutError, OSError) as error:
            self._log_delivery_failure(error, recipient=recipient, otp=otp, api_key=api_key)
            raise EmailDeliveryError("OTP email delivery failed") from error

    def _handle_response(
        self,
        response: httpx.Response,
        *,
        recipient: str,
        otp: str,
        api_key: str,
    ) -> None:
        """Validate Resend HTTP response and log failures safely."""
        if response.is_success:
            return

        status_code = response.status_code
        masked_recipient = _mask_recipient(recipient)

        log_data: dict[str, object] = {
            "event": "resend_otp_delivery_failed",
            "exceptionClass": "ResendApiError",
            "statusCode": status_code,
            "recipient": masked_recipient,
        }

        raw_text = response.text
        if raw_text:
            log_data["message"] = _sanitize_message(
                raw_text,
                otp=otp,
                recipient=recipient,
                api_key=api_key,
            )

        logger.error(json.dumps(log_data, default=str))
        raise EmailDeliveryError("OTP email delivery failed")

    def _log_delivery_failure(
        self,
        error: BaseException,
        *,
        recipient: str,
        otp: str,
        api_key: str,
    ) -> None:
        """Emit structured diagnostic logs for transport errors without secrets."""
        exception_class = type(error).__name__
        masked_recipient = _mask_recipient(recipient)

        log_data: dict[str, object] = {
            "event": "resend_otp_delivery_failed",
            "exceptionClass": exception_class,
            "recipient": masked_recipient,
        }

        raw_message = str(error)
        if raw_message:
            log_data["message"] = _sanitize_message(
                raw_message,
                otp=otp,
                recipient=recipient,
                api_key=api_key,
            )

        logger.error(json.dumps(log_data, default=str))


def create_otp_email_sender(settings: Settings) -> OtpEmailSender:
    """Create the configured OTP email sender based on settings.email_provider."""
    provider = settings.email_provider.strip().lower()
    if provider == "resend":
        return ResendOtpEmailSender(settings)
    if provider == "smtp":
        return SmtpOtpEmailSender(settings)
    raise EmailDeliveryError(f"Unsupported EMAIL_PROVIDER: '{settings.email_provider}'")
