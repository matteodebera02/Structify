import logging
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repo import UserRepository
from app.schemas.auth import AuthResponse, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, UserResponse
from app.services.email_service import send_reset_email

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def register(self, data: RegisterRequest) -> AuthResponse:
        if self.repo.get_by_email(data.email):
            raise HTTPException(status_code=400, detail="Email already registered")
        user = self.repo.create(email=data.email, password_hash=hash_password(data.password))
        token = create_access_token({"sub": str(user.id)})
        logger.info("registered user=%d", user.id)
        return AuthResponse(access_token=token, user=UserResponse.model_validate(user))

    def login(self, data: LoginRequest) -> AuthResponse:
        user = self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            logger.warning("failed login email=%s", data.email)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        token = create_access_token({"sub": str(user.id)})
        logger.info("login user=%d", user.id)
        return AuthResponse(access_token=token, user=UserResponse.model_validate(user))

    def forgot_password(self, data: ForgotPasswordRequest) -> None:
        user = self.repo.get_by_email(data.email)
        # always return 200 — don't leak whether email exists
        if not user:
            logger.info("forgot_password: email not found, silently ignored")
            return
        token = uuid.uuid4().hex
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
        self.repo.set_reset_token(user, token, expires_at)
        try:
            send_reset_email(user.email, token)
        except RuntimeError:
            # email failed but token is saved — log and return 200 anyway
            logger.error("email delivery failed for user=%d, token saved but not sent", user.id)
            return
        logger.info("reset token issued user=%d", user.id)

    def reset_password(self, data: ResetPasswordRequest) -> None:
        user = self.repo.get_by_reset_token(data.token)
        if not user or user.reset_token_expires_at is None:
            raise HTTPException(status_code=400, detail="Invalid or expired reset link")
        expires_at = user.reset_token_expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="Reset link has expired")
        self.repo.update_password(user, hash_password(data.password))
        logger.info("password reset user=%d", user.id)
