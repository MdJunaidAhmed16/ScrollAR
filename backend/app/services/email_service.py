import time

from app.config import settings

_last_alert_time: float = 0.0
_ALERT_COOLDOWN = 300  # max 1 crash alert per 5 minutes


def _send(to: str, subject: str, html: str) -> None:
    if not settings.SMTP_PASSWORD:  # SMTP_PASSWORD holds the Resend API key
        print("[EMAIL] RESEND_API_KEY not set — skipping", flush=True)
        return

    import resend
    resend.api_key = settings.SMTP_PASSWORD

    resend.Emails.send({
        "from": f"ScrollAr <{settings.SMTP_USER}>",
        "to": [to],
        "subject": subject,
        "html": html,
    })


def send_password_reset(to_email: str, reset_url: str) -> None:
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
      <h2 style="color:#818cf8;">ScrollAr — Password Reset</h2>
      <p>Click the button below to reset your password.
         This link expires in <strong>1 hour</strong>.</p>
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
        print(f"[EMAIL] Sending reset to {to_email} via Resend", flush=True)
        _send(to_email, "ScrollAr — Reset your password", html)
        print(f"[EMAIL] Sent successfully to {to_email}", flush=True)
    except Exception as e:
        import traceback
        print(f"[EMAIL] FAILED: {e}", flush=True)
        traceback.print_exc()


def send_error_alert(path: str, method: str, error: str) -> None:
    global _last_alert_time
    if not settings.ALERT_EMAIL:
        return

    now = time.time()
    if now - _last_alert_time < _ALERT_COOLDOWN:
        return
    _last_alert_time = now

    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
      <h2 style="color:#ef4444;">🚨 ScrollAr — Server Error</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;color:#6b7280;">Endpoint</td>
            <td style="padding:6px 0;"><code>{method} {path}</code></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Error</td>
            <td style="padding:6px 0;color:#ef4444;">
              <pre style="margin:0;white-space:pre-wrap;">{error[:1000]}</pre>
            </td></tr>
      </table>
    </div>
    """
    try:
        _send(settings.ALERT_EMAIL, "🚨 ScrollAr server error", html)
    except Exception as e:
        print(f"[EMAIL] Failed to send error alert: {e}", flush=True)
