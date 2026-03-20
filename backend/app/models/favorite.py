"""收藏模型."""
from datetime import UTC, datetime
from uuid import UUID

from sqlmodel import Field, SQLModel


class Favorite(SQLModel, table=True):
    """收藏表模型 - 联合主键."""
    __tablename__ = "favorites"

    user_id: UUID = Field(foreign_key="users.id", primary_key=True)
    skill_id: UUID = Field(foreign_key="skills.id", primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
