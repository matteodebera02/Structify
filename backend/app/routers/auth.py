import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.auth import (
    AuthResponse, ForgotPasswordRequest, LoginRequest, RegisterRequest,
    ResetPasswordRequest, UpdateSettingsRequest, UserSettingsResponse,
)
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)

router = APIRouter()


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))


@router.post("/register", response_model=AuthResponse)
def register(data: RegisterRequest, service: AuthService = Depends(get_auth_service)):
    return service.register(data)


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, service: AuthService = Depends(get_auth_service)):
    return service.login(data)


@router.post("/forgot-password", status_code=204)
def forgot_password(data: ForgotPasswordRequest, service: AuthService = Depends(get_auth_service)):
    service.forgot_password(data)


@router.post("/reset-password", status_code=204)
def reset_password(data: ResetPasswordRequest, service: AuthService = Depends(get_auth_service)):
    service.reset_password(data)


def _mask_key(key: str) -> str:
    if len(key) <= 8:
        return "••••••••"
    return "•" * max(len(key) - 8, 4) + key[-8:]


def _build_settings_response(user: User) -> UserSettingsResponse:
    return UserSettingsResponse(
        id=user.id,
        email=user.email,
        has_groq_key=bool(user.groq_api_key),
        groq_key_preview=_mask_key(user.groq_api_key) if user.groq_api_key else None,
    )


@router.get("/users/me", response_model=UserSettingsResponse)
def get_me(user: User = Depends(get_current_user)):
    return _build_settings_response(user)


@router.patch("/users/me", response_model=UserSettingsResponse)
def update_settings(
    data: UpdateSettingsRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = UserRepository(db)
    updated = repo.update_groq_key(user, data.groq_api_key.strip() or None)
    logger.info("updated groq_key user=%d has_key=%s", user.id, bool(updated.groq_api_key))
    return _build_settings_response(updated)


@router.delete("/users/me", status_code=204)
def delete_account(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    repo = UserRepository(db)
    logger.info("deleting account user=%d", user.id)
    repo.delete(user)
