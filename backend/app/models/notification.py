"""通知模型."""
from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class NotificationBase(SQLModel):
    """通知基础字段."""
    type: str = Field(max_length=50)  # skill_update, etc.
    message: str = Field(max_length=255)
    is_read: bool = Field(default=False)


class Notification(NotificationBase, table=True):
    """通知表模型."""
    __tablename__ = "notifications"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    skill_id: UUID | None = Field(default=None, foreign_key="skills.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
