import logging
import smtplib
import ssl
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger("scrollar")

# Simple in-memory rate limit for error alerts: max 1 per 5 minutes
_last_alert_time: float = 0.0
_ALERT_COOLDOWN = 300  # seconds


def _send(to: str, subject: str, html: str) -> None:
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning("Email not configured — skipping send to %s", to)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"ScrollAr <{settings.SMTP_USER}>"
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    ctx = ssl.create_default_context()
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.ehlo()
        server.starttls(context=ctx)
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to, msg.as_string())


def send_password_reset(to_email: str, reset_url: str) -> None:
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
      <h2 style="color:#818cf8;">ScrollAr — Password Reset</h2>
      <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
      <a href="{reset_url}"
         style="display:inline-block;margin:24px 0;padding:12px 28px;
                background:#818cf8;color:#fff;border-radius:8px;
                text-decoration:none;font-weight:600;">
        Reset Password
      </a>
      <p style="color:#6b7280;font-size:13px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    """
    try:
        _send(to_email, "ScrollAr — Reset your password", html)
    except Exception as e:
        logger.error("Failed to send password reset email to %s: %s", to_email, e)


def send_error_alert(path: str, method: str, error: str) -> None:
    global _last_alert_time
    if not settings.ALERT_EMAIL:
        return

    now = time.time()
    if now - _last_alert_time < _ALERT_COOLDOWN:
        return  # rate-limited
    _last_alert_time = now

    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
      <h2 style="color:#ef4444;">🚨 ScrollAr — Server Error</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;color:#6b7280;">Endpoint</td>
            <td style="padding:6px 0;"><code>{method} {path}</code></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Error</td>
            <td style="padding:6px 0;color:#ef4444;"><pre style="margin:0;white-space:pre-wrap;">{error[:1000]}</pre></td></tr>
      </table>
    </div>
    """
    try:
        _send(settings.ALERT_EMAIL, "🚨 ScrollAr server error", html)
    except Exception as e:
        logger.error("Failed to send error alert: %s", e)
