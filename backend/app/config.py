from typing import Optional
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# Project root:
# UniBridge/
# ├── .env
# └── backend/
#     └── app/
#         └── config.py
BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    mongodb_uri: str
    mongodb_database: str = "unibridge"

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    cloudinary_cloud_name: Optional[str] = None
    cloudinary_api_key: Optional[str] = None
    cloudinary_api_secret: Optional[str] = None

    allowed_origins: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=(".env", str(BASE_DIR / ".env")),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()