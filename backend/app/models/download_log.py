"""下载日志模型."""

from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class DownloadLog(SQLModel, table=True):
    """下载记录表."""

    __tablename__ = "download_logs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    skill_id: UUID = Field(foreign_key="skills.id", index=True)
    user_id: UUID | None = Field(default=None, foreign_key="users.id")
    ip_address: str | None = Field(default=None, max_length=45)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
