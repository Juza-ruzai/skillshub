"""应用配置管理."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置类."""

    model_config = SettingsConfigDict(
        env_file=".env.backend",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/openclaw"

    # JWT
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 1440
    refresh_token_expire_days: int = 7

    # File Storage
    upload_dir: str = "../uploads/skills"
    max_file_size: int = 52428800

    # CORS (逗号分隔字符串，兼容 .env 文件格式)
    allowed_origins: str = "http://localhost:5173,http://localhost:5174"

    # Environment
    environment: str = "development"

    @property
    def upload_path(self) -> Path:
        """返回上传目录的 Path 对象."""
        return Path(self.upload_dir).resolve()

    @property
    def cors_origins(self) -> list[str]:
        """返回 CORS 允许的来源列表."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    """获取配置单例."""
    return Settings()
