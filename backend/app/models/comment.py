"""评论模型."""
from datetime import UTC, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class CommentBase(SQLModel):
    """评论基础字段."""
    content: str
    is_deleted: bool = Field(default=False)


class Comment(CommentBase, table=True):
    """评论表模型."""
    __tablename__ = "comments"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    skill_id: UUID = Field(foreign_key="skills.id", index=True)
    user_id: UUID = Field(foreign_key="users.id")
    parent_id: UUID | None = Field(default=None, foreign_key="comments.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
