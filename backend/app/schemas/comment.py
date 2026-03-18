"""Comment 相关 Pydantic Schema."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CommentCreate(BaseModel):
    """创建评论请求 Schema."""

    content: str = Field(..., min_length=1, max_length=2000, description="评论内容")
    parent_id: UUID | None = Field(None, description="父评论 ID，回复时填写")


class CommentResponse(BaseModel):
    """评论响应 Schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    skill_id: UUID
    user_id: UUID
    username: str = ""
    content: str
    parent_id: UUID | None = None
    is_deleted: bool = False
    created_at: datetime
    updated_at: datetime


class CommentWithReplies(CommentResponse):
    """带嵌套回复的评论响应 Schema."""

    replies: list["CommentResponse"] = Field(default_factory=list)


# 更新 forward reference
CommentWithReplies.model_rebuild()
