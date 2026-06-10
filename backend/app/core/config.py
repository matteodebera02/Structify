from pydantic_settings import BaseSettings

# Class to store environment variables
class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://structify:structify@localhost:5432/structify"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 540
    GROQ_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "onboarding@resend.dev"
    FRONTEND_URL: str = "http://localhost:5173"

# Class to load environment variables
    class Config:
        env_file = ".env"


settings = Settings()
