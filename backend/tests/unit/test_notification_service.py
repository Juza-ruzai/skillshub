"""Notification Service 单元测试."""
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.skill import Skill
from app.models.user import User
from app.services.notification_service import NotificationService


@pytest.fixture
async def setup_users(db_session: AsyncSession) -> tuple[User, User]:
    """创建测试用户."""
    unique_id = uuid4().hex[:8]

    author = User(
        username=f"author_{unique_id}",
        email=f"author_{unique_id}@test.com",
        password_hash="hashed_password",
    )
    db_session.add(author)

    follower = User(
        username=f"follower_{unique_id}",
        email=f"follower_{unique_id}@test.com",
        password_hash="hashed_password",
    )
    db_session.add(follower)

    await db_session.flush()
    return author, follower


@pytest.fixture
async def setup_skill(
    db_session: AsyncSession, setup_users: tuple[User, User]
) -> Skill:
    """创建测试 Skill."""
    author, _ = setup_users
    skill = Skill(
        name="Test Skill",
        description="Test description",
        usage_scenario="Test scenario",
        usage_method="Test method",
        file_path="/test/path",
        file_size=1024,
        author_id=author.id,
    )
    db_session.add(skill)
    await db_session.flush()
    return skill


class TestNotificationServiceCreateNotification:
    """测试创建通知."""

    async def test_create_skill_update_notification(
        self,
        db_session: AsyncSession,
        setup_skill: Skill,
        setup_users: tuple[User, User],
    ) -> None:
        """测试创建 Skill 更新通知."""
        _, follower = setup_users
        skill = setup_skill
        service = NotificationService()

        notification = await service.create_notification(
            db_session=db_session,
            user_id=follower.id,
            notification_type="skill_update",
            skill_id=skill.id,
            message=f"Skill '{skill.name}' 已更新",
        )

        assert notification.id is not None
        assert notification.user_id == follower.id
        assert notification.type == "skill_update"
        assert notification.skill_id == skill.id
        assert notification.is_read is False

    async def test_create_multiple_notifications(
        self,
        db_session: AsyncSession,
        setup_skill: Skill,
        setup_users: tuple[User, User],
    ) -> None:
        """测试为多个用户创建通知."""
        author, follower = setup_users
        skill = setup_skill
        service = NotificationService()

        # 为两个用户创建通知
        notifications = await service.create_notifications_for_users(
            db_session=db_session,
            user_ids=[author.id, follower.id],
            notification_type="skill_update",
            skill_id=skill.id,
            message="Skill 已更新",
        )

        assert len(notifications) == 2


class TestNotificationServiceGetNotifications:
    """测试获取通知."""

    async def test_get_user_notifications_empty(
        self, db_session: AsyncSession
    ) -> None:
        """测试获取空通知列表."""
        service = NotificationService()
        notifications = await service.get_user_notifications(
            db_session=db_session,
            user_id=uuid4(),
        )
        assert notifications == []

    async def test_get_user_notifications(
        self,
        db_session: AsyncSession,
        setup_skill: Skill,
        setup_users: tuple[User, User],
    ) -> None:
        """测试获取用户通知列表."""
        _, follower = setup_users
        skill = setup_skill
        service = NotificationService()

        # 创建两条通知
        await service.create_notification(
            db_session=db_session,
            user_id=follower.id,
            notification_type="skill_update",
            skill_id=skill.id,
            message="通知1",
        )
        await service.create_notification(
            db_session=db_session,
            user_id=follower.id,
            notification_type="skill_update",
            skill_id=skill.id,
            message="通知2",
        )

        # 获取通知
        notifications = await service.get_user_notifications(
            db_session=db_session,
            user_id=follower.id,
        )

        assert len(notifications) == 2

    async def test_get_unread_count(
        self,
        db_session: AsyncSession,
        setup_skill: Skill,
        setup_users: tuple[User, User],
    ) -> None:
        """测试获取未读通知数量."""
        _, follower = setup_users
        skill = setup_skill
        service = NotificationService()

        # 创建3条通知
        await service.create_notification(
            db_session=db_session,
            user_id=follower.id,
            notification_type="skill_update",
            skill_id=skill.id,
            message="通知1",
        )
        await service.create_notification(
            db_session=db_session,
            user_id=follower.id,
            notification_type="skill_update",
            skill_id=skill.id,
            message="通知2",
        )
        await service.create_notification(
            db_session=db_session,
            user_id=follower.id,
            notification_type="skill_update",
            skill_id=skill.id,
            message="通知3",
        )

        count = await service.get_unread_count(
            db_session=db_session,
            user_id=follower.id,
        )

        assert count == 3


class TestNotificationServiceMarkAsRead:
    """测试标记已读."""

    async def test_mark_as_read(
        self,
        db_session: AsyncSession,
        setup_skill: Skill,
        setup_users: tuple[User, User],
    ) -> None:
        """测试标记单条通知已读."""
        _, follower = setup_users
        skill = setup_skill
        service = NotificationService()

        notification = await service.create_notification(
            db_session=db_session,
            user_id=follower.id,
            notification_type="skill_update",
            skill_id=skill.id,
            message="测试通知",
        )

        # 标记已读
        await service.mark_as_read(
            db_session=db_session,
            notification_id=notification.id,
            user_id=follower.id,
        )

        # 验证已读
        count = await service.get_unread_count(
            db_session=db_session,
            user_id=follower.id,
        )
        assert count == 0

    async def test_mark_as_read_other_user_fails(
        self,
        db_session: AsyncSession,
        setup_skill: Skill,
        setup_users: tuple[User, User],
    ) -> None:
        """测试不能标记他人通知已读."""
        author, follower = setup_users
        skill = setup_skill
        service = NotificationService()

        notification = await service.create_notification(
            db_session=db_session,
            user_id=follower.id,
            notification_type="skill_update",
            skill_id=skill.id,
            message="测试通知",
        )

        # 尝试用其他用户标记已读
        with pytest.raises(PermissionError, match="无权操作此通知"):
            await service.mark_as_read(
                db_session=db_session,
                notification_id=notification.id,
                user_id=author.id,
            )

    async def test_mark_all_as_read(
        self,
        db_session: AsyncSession,
        setup_skill: Skill,
        setup_users: tuple[User, User],
    ) -> None:
        """测试标记所有通知已读."""
        _, follower = setup_users
        skill = setup_skill
        service = NotificationService()

        # 创建3条通知
        for i in range(3):
            await service.create_notification(
                db_session=db_session,
                user_id=follower.id,
                notification_type="skill_update",
                skill_id=skill.id,
                message=f"通知{i + 1}",
            )

        # 标记全部已读
        count = await service.mark_all_as_read(
            db_session=db_session,
            user_id=follower.id,
        )

        assert count == 3

        # 验证已读
        unread_count = await service.get_unread_count(
            db_session=db_session,
            user_id=follower.id,
        )
        assert unread_count == 0
