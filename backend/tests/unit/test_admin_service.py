"""Admin 服务层单元测试."""
from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

if TYPE_CHECKING:
    from app.services.admin_service import AdminService


class TestAdminService:
    """Admin 服务测试."""

    @pytest.fixture
    def admin_service(self, db_session: AsyncSession):
        """创建 Admin 服务实例."""
        from app.services.admin_service import AdminService
        return AdminService(db_session)

    @pytest.fixture
    async def test_admin(self, db_session: AsyncSession) -> dict:
        """创建测试管理员."""
        from app.core.security import get_password_hash
        from app.models.user import User

        unique_id = str(uuid4())[:8]
        username = f"admin_{unique_id}"
        email = f"admin_{unique_id}@example.com"

        user = User(
            id=uuid4(),
            username=username,
            email=email,
            password_hash=get_password_hash("Admin123!"),
            is_admin=True,
            is_active=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }

    @pytest.fixture
    async def test_user(self, db_session: AsyncSession) -> dict:
        """创建测试普通用户."""
        from app.core.security import get_password_hash
        from app.models.user import User

        unique_id = str(uuid4())[:8]
        username = f"user_{unique_id}"
        email = f"user_{unique_id}@example.com"

        user = User(
            id=uuid4(),
            username=username,
            email=email,
            password_hash=get_password_hash("User123!"),
            is_admin=False,
            is_active=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }

    @pytest.fixture
    async def test_skill(self, db_session: AsyncSession, test_user: dict) -> dict:
        """创建测试 Skill."""
        from app.models.skill import Skill

        unique_id = str(uuid4())[:8]

        skill = Skill(
            id=uuid4(),
            name=f"Test Skill {unique_id}",
            description="Test description for skill",
            usage_scenario="Test scenario",
            usage_method="Test method",
            file_path=f"/uploads/skills/{unique_id}/test.zip",
            file_size=1024,
            author_id=test_user["id"],
            tags=["test", "demo"],
            is_deleted=False,
        )
        db_session.add(skill)
        await db_session.commit()
        await db_session.refresh(skill)

        return {
            "id": skill.id,
            "name": skill.name,
            "author_id": skill.author_id,
        }

    @pytest.mark.asyncio
    async def test_update_skill_success(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_skill: dict,
    ) -> None:
        """测试管理员更新 Skill 成功."""
        updated_skill = await admin_service.update_skill(
            skill_id=test_skill["id"],
            name="Updated Skill Name",
            description="Updated description",
            usage_scenario="Updated scenario",
            usage_method="Updated method",
            tags=["updated", "tag"],
        )

        assert updated_skill is not None
        assert updated_skill.name == "Updated Skill Name"
        assert updated_skill.description == "Updated description"
        assert updated_skill.tags == ["updated", "tag"]

    @pytest.mark.asyncio
    async def test_update_skill_not_found(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
    ) -> None:
        """测试更新不存在的 Skill."""
        from app.services.admin_service import AdminService

        service = AdminService(db_session)
        result = await service.update_skill(
            skill_id=uuid4(),
            name="Updated Name",
            description="Updated description",
            usage_scenario="Updated scenario",
            usage_method="Updated method",
            tags=["updated"],
        )

        assert result is None

    @pytest.mark.asyncio
    async def test_force_delete_skill_success(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_skill: dict,
    ) -> None:
        """测试强制删除 Skill 成功."""
        from app.services.admin_service import AdminService

        service = AdminService(db_session)
        result = await service.force_delete_skill(test_skill["id"])

        assert result is True

        # 验证已物理删除
        from sqlalchemy import select
        from app.models.skill import Skill

        query_result = await db_session.execute(
            select(Skill).where(Skill.id == test_skill["id"])
        )
        assert query_result.scalar_one_or_none() is None

    @pytest.mark.asyncio
    async def test_force_delete_skill_not_found(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
    ) -> None:
        """测试删除不存在的 Skill."""
        from app.services.admin_service import AdminService

        service = AdminService(db_session)
        result = await service.force_delete_skill(uuid4())

        assert result is False

    @pytest.mark.asyncio
    async def test_list_deleted_skills(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_skill: dict,
    ) -> None:
        """测试获取软删除 Skill 列表."""
        from app.services.admin_service import AdminService

        # 先软删除 Skill
        from sqlalchemy import select
        from app.models.skill import Skill

        result = await db_session.execute(
            select(Skill).where(Skill.id == test_skill["id"])
        )
        skill = result.scalar_one()
        skill.is_deleted = True
        await db_session.commit()

        service = AdminService(db_session)
        items, total = await service.list_deleted_skills()

        assert total >= 1
        assert any(item.id == test_skill["id"] for item in items)

    @pytest.mark.asyncio
    async def test_restore_skill_success(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_skill: dict,
    ) -> None:
        """测试恢复软删除的 Skill."""
        from app.services.admin_service import AdminService

        # 先软删除 Skill
        from sqlalchemy import select
        from app.models.skill import Skill

        result = await db_session.execute(
            select(Skill).where(Skill.id == test_skill["id"])
        )
        skill = result.scalar_one()
        skill.is_deleted = True
        await db_session.commit()

        service = AdminService(db_session)
        restored_skill = await service.restore_skill(test_skill["id"])

        assert restored_skill is not None
        assert restored_skill.is_deleted is False

    @pytest.mark.asyncio
    async def test_restore_skill_not_deleted(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_skill: dict,
    ) -> None:
        """测试恢复未被删除的 Skill."""
        from app.services.admin_service import AdminService

        service = AdminService(db_session)
        result = await service.restore_skill(test_skill["id"])

        assert result is None

    @pytest.mark.asyncio
    async def test_get_skill_downloads(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_skill: dict,
        test_user: dict,
    ) -> None:
        """测试获取 Skill 下载用户列表."""
        from app.services.admin_service import AdminService

        # 创建下载记录
        from app.models.download_log import DownloadLog

        download = DownloadLog(
            skill_id=test_skill["id"],
            user_id=test_user["id"],
            ip_address="127.0.0.1",
        )
        db_session.add(download)
        await db_session.commit()

        service = AdminService(db_session)
        items, total = await service.get_skill_downloads(test_skill["id"])

        assert total >= 1
        assert any(item.user_id == test_user["id"] for item in items)

    @pytest.mark.asyncio
    async def test_list_users(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_user: dict,
    ) -> None:
        """测试获取用户列表."""
        from app.services.admin_service import AdminService

        service = AdminService(db_session)
        items, total = await service.list_users()

        assert total >= 1
        assert any(item.id == test_user["id"] for item in items)

    @pytest.mark.asyncio
    async def test_search_users(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_user: dict,
    ) -> None:
        """测试搜索用户."""
        from app.services.admin_service import AdminService

        service = AdminService(db_session)
        items, total = await service.list_users(search=test_user["username"])

        assert total >= 1
        assert any(item.username == test_user["username"] for item in items)

    @pytest.mark.asyncio
    async def test_set_user_admin_status(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_user: dict,
    ) -> None:
        """测试设置用户管理员权限."""
        from app.services.admin_service import AdminService

        service = AdminService(db_session)
        user = await service.set_user_admin_status(test_user["id"], is_admin=True)

        assert user is not None
        assert user.is_admin is True

        # 恢复
        user = await service.set_user_admin_status(test_user["id"], is_admin=False)
        assert user.is_admin is False

    @pytest.mark.asyncio
    async def test_set_user_active_status(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_user: dict,
    ) -> None:
        """测试设置用户活跃状态."""
        from app.services.admin_service import AdminService

        service = AdminService(db_session)
        user = await service.set_user_active_status(test_user["id"], is_active=False)

        assert user is not None
        assert user.is_active is False

        # 恢复
        user = await service.set_user_active_status(test_user["id"], is_active=True)
        assert user.is_active is True

    @pytest.mark.asyncio
    async def test_list_comments(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_skill: dict,
        test_user: dict,
    ) -> None:
        """测试获取评论列表."""
        from app.services.admin_service import AdminService

        # 创建评论
        from app.models.comment import Comment

        comment = Comment(
            content="Test comment",
            skill_id=test_skill["id"],
            user_id=test_user["id"],
        )
        db_session.add(comment)
        await db_session.commit()

        items, total = await admin_service.list_comments()

        assert total >= 1
        assert any(item[0].content == "Test comment" for item in items)

    @pytest.mark.asyncio
    async def test_get_overview_stats(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
    ) -> None:
        """测试获取平台概览统计."""
        from app.services.admin_service import AdminService

        service = AdminService(db_session)
        stats = await service.get_overview_stats()

        assert "total_skills" in stats
        assert "total_users" in stats
        assert "today_downloads" in stats
        assert "today_comments" in stats
        assert "today_uploads" in stats

    @pytest.mark.asyncio
    async def test_get_active_users(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_user: dict,
    ) -> None:
        """测试获取活跃用户榜单."""
        from app.services.admin_service import AdminService

        items = await admin_service.get_active_users(days=30, limit=10)

        assert isinstance(items, list)
        # 验证返回格式正确（不依赖具体数据，因为数据库状态可能不同）
        if items:
            assert "user_id" in items[0]
            assert "username" in items[0]
            assert "download_count" in items[0]
            assert "comment_count" in items[0]
            assert "upload_count" in items[0]
            assert "total_score" in items[0]

    @pytest.mark.asyncio
    async def test_export_users_csv(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
        test_user: dict,
    ) -> None:
        """测试导出用户 CSV."""
        from app.services.admin_service import AdminService

        service = AdminService(db_session)
        csv_content = await service.export_users_csv()

        assert "username" in csv_content
        assert test_user["username"] in csv_content

    @pytest.mark.asyncio
    async def test_export_tags_csv(
        self,
        admin_service: AdminService,
        db_session: AsyncSession,
    ) -> None:
        """测试导出标签 CSV."""
        from app.services.admin_service import AdminService

        # 创建标签
        from app.models.tag import Tag

        tag = Tag(name=f"test_tag_{uuid4().hex[:8]}", usage_count=1)
        db_session.add(tag)
        await db_session.commit()

        service = AdminService(db_session)
        csv_content = await service.export_tags_csv()

        assert "name" in csv_content
        assert tag.name in csv_content
