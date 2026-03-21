"""Notification 相关 Pydantic Schema."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    """通知响应 Schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    type: str
    skill_id: UUID | None = None
    message: str
    is_read: bool = False
    created_at: datetime


class NotificationListResponse(BaseModel):
    """通知列表响应 Schema."""

    notifications: list[NotificationResponse]
    unread_count: int
