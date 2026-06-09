from datetime import datetime
from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    reset_token: Mapped[str | None] = mapped_column(String, nullable=True, default=None)
    reset_token_expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, default=None)
    groq_api_key: Mapped[str | None] = mapped_column(String(255), nullable=True, default=None)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
