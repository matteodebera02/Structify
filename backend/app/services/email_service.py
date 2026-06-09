import logging

import resend
from resend.exceptions import ResendError

from app.core.config import settings

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY


def send_reset_email(to_email: str, token: str) -> None:
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    try:
        resend.Emails.send({
            "from": "Structify <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "Reset your Structify password",
            "html": f"""
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
              <h2 style="font-size: 20px; color: #0f0f0f; margin-bottom: 8px;">Reset your password</h2>
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">
                Click the button below to set a new password. This link expires in 15 minutes.
              </p>
              <a href="{reset_url}"
                 style="display: inline-block; background: #e91e8c; color: #fff;
                        font-size: 14px; font-weight: 600; padding: 12px 24px;
                        border-radius: 8px; text-decoration: none;">
                Reset password
              </a>
              <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
                If you didn't request this, ignore this email — your password won't change.
              </p>
            </div>
            """,
        })
        logger.info("reset email sent to=%s", to_email)
    except ResendError as e:
        # in sandbox mode resend only allows sending to the account owner's email
        logger.error("resend failed for=%s: %s", to_email, e)
        raise RuntimeError("Email delivery failed") from e
