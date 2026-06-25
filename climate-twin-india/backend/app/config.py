"""
app/config.py
──────────────────────────────────────────────────────────────────────────────
Centralised configuration loaded from environment variables / .env file.
All settings are validated at startup via Pydantic BaseSettings.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",          # ignore any unknown keys in .env
    )

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:password@localhost:5432/climate_twin"
    )

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── NASA POWER ────────────────────────────────────────────────────────────
    NASA_POWER_API_KEY: str = ""

    # ── Google Gemini AI ──────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""

    # ── Twilio ────────────────────────────────────────────────────────────────
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_FROM: str = ""

    # ── SMTP ──────────────────────────────────────────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # ── JWT / Auth ────────────────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-must-be-at-least-32-chars!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # ── Open-Meteo ────────────────────────────────────────────────────────────
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"

    # ── Application ───────────────────────────────────────────────────────────
    APP_NAME: str = "AI-Powered Digital Twin of India's Climate"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    WEATHER_CACHE_TTL: int = 3600          # 1 hour in seconds
    ML_MODELS_DIR: str = "app/ml/saved_models"


@lru_cache()
def get_settings() -> Settings:
    """Return a cached singleton of Settings."""
    return Settings()


# Convenience alias used throughout the codebase
settings = get_settings()
