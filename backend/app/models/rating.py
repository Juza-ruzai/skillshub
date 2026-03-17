"""评分模型."""
from datetime import UTC, datetime
from uuid import UUID

from sqlmodel import Field, SQLModel


class Rating(SQLModel, table=True):
    """评分表模型 - 联合主键."""
    __tablename__ = "ratings"

    user_id: UUID = Field(foreign_key="users.id", primary_key=True)
    skill_id: UUID = Field(foreign_key="skills.id", primary_key=True)
    score: int = Field(ge=1, le=5)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
