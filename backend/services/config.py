import os
from dataclasses import dataclass


def _bool_env(key: str, default: bool) -> bool:
    value = os.getenv(key)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    env: str
    port: int
    cors_origins: str
    mongo_uri: str
    mongo_db_name: str
    jwt_secret: str
    max_upload_size_mb: int
    rate_limit_per_minute: int
    enable_enterprise: bool
    enable_billing: bool


def load_settings() -> Settings:
    return Settings(
        env=os.getenv("APP_ENV", os.getenv("FLASK_ENV", "development")),
        port=int(os.getenv("PORT", "5000")),
        cors_origins=os.getenv("CORS_ORIGINS", "*"),
        mongo_uri=os.getenv("MONGODB_URI", ""),
        mongo_db_name=os.getenv("MONGODB_DB", "agentic_ai_career_coach"),
        jwt_secret=os.getenv("JWT_SECRET", "change-me-in-production"),
        max_upload_size_mb=int(os.getenv("MAX_UPLOAD_SIZE_MB", "8")),
        rate_limit_per_minute=int(os.getenv("RATE_LIMIT_PER_MINUTE", "120")),
        enable_enterprise=_bool_env("ENABLE_ENTERPRISE", True),
        enable_billing=_bool_env("ENABLE_BILLING", True),
    )

