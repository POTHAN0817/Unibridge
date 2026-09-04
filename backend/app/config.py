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

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()