"""标签模型."""
from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class TagBase(SQLModel):
    """标签基础字段."""
    name: str = Field(max_length=30, unique=True, index=True)
    usage_count: int = Field(default=0)


class Tag(TagBase, table=True):
    """标签表模型."""
    __tablename__ = "tags"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
