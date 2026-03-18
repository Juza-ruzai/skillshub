"""通知服务层 - 处理站内通知的业务逻辑."""
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


class NotificationService:
    """通知服务类."""

    async def create_notification(
        self,
        db_session: AsyncSession,
        user_id: UUID,
        notification_type: str,
        skill_id: UUID | None = None,
        message: str = "",
    ) -> Notification:
        """创建通知.

        Args:
            db_session: 数据库会话
            user_id: 接收用户 ID
            notification_type: 通知类型（如 skill_update）
            skill_id: 关联的 Skill ID（可选）
            message: 通知内容

        Returns:
            Notification 实例
        """
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            skill_id=skill_id,
            message=message,
        )
        db_session.add(notification)
        await db_session.commit()
        await db_session.refresh(notification)
        return notification

    async def create_notifications_for_users(
        self,
        db_session: AsyncSession,
        user_ids: list[UUID],
        notification_type: str,
        skill_id: UUID | None = None,
        message: str = "",
    ) -> list[Notification]:
        """为多个用户批量创建通知.

        Args:
            db_session: 数据库会话
            user_ids: 用户 ID 列表
            notification_type: 通知类型
            skill_id: 关联的 Skill ID（可选）
            message: 通知内容

        Returns:
            Notification 实例列表
        """
        notifications = []
        for user_id in user_ids:
            notification = Notification(
                user_id=user_id,
                type=notification_type,
                skill_id=skill_id,
                message=message,
            )
            db_session.add(notification)
            notifications.append(notification)

        await db_session.commit()

        # 刷新所有通知
        for notification in notifications:
            await db_session.refresh(notification)

        return notifications

    async def get_user_notifications(
        self,
        db_session: AsyncSession,
        user_id: UUID,
        unread_only: bool = False,
        limit: int = 50,
    ) -> list[Notification]:
        """获取用户通知列表.

        Args:
            db_session: 数据库会话
            user_id: 用户 ID
            unread_only: 是否只获取未读
            limit: 返回数量限制

        Returns:
            通知列表
        """
        query = select(Notification).where(Notification.user_id == user_id)

        if unread_only:
            query = query.where(Notification.is_read == False)  # noqa: E712

        query = query.order_by(Notification.created_at.desc()).limit(limit)

        result = await db_session.execute(query)
        return list(result.scalars().all())

    async def get_unread_count(
        self,
        db_session: AsyncSession,
        user_id: UUID,
    ) -> int:
        """获取未读通知数量.

        Args:
            db_session: 数据库会话
            user_id: 用户 ID

        Returns:
            未读通知数量
        """
        result = await db_session.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == user_id,
                Notification.is_read == False,  # noqa: E712
            )
        )
        return result.scalar_one()

    async def mark_as_read(
        self,
        db_session: AsyncSession,
        notification_id: UUID,
        user_id: UUID,
    ) -> None:
        """标记单条通知已读.

        Args:
            db_session: 数据库会话
            notification_id: 通知 ID
            user_id: 用户 ID

        Raises:
            ValueError: 通知不存在
            PermissionError: 无权操作
        """
        result = await db_session.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        notification = result.scalar_one_or_none()

        if notification is None:
            raise ValueError("通知不存在")

        if notification.user_id != user_id:
            raise PermissionError("无权操作此通知")

        notification.is_read = True
        await db_session.commit()

    async def mark_all_as_read(
        self,
        db_session: AsyncSession,
        user_id: UUID,
    ) -> int:
        """标记用户所有通知已读.

        Args:
            db_session: 数据库会话
            user_id: 用户 ID

        Returns:
            更新的通知数量
        """
        result = await db_session.execute(
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)  # noqa: E712
            .values(is_read=True)
        )
        await db_session.commit()
        return result.rowcount
