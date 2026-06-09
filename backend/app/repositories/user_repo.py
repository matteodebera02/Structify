from sqlalchemy.orm import Session

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_reset_token(self, token: str) -> User | None:
        return self.db.query(User).filter(User.reset_token == token).first()

    def create(self, email: str, password_hash: str) -> User:
        user = User(email=email, password_hash=password_hash)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def set_reset_token(self, user: User, token: str, expires_at) -> None:
        user.reset_token = token
        user.reset_token_expires_at = expires_at
        self.db.commit()

    def update_password(self, user: User, password_hash: str) -> None:
        user.password_hash = password_hash
        user.reset_token = None
        user.reset_token_expires_at = None
        self.db.commit()

    def update_groq_key(self, user: User, key: str | None) -> User:
        user.groq_api_key = key or None
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()
