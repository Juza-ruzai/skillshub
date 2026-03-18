"""收藏服务测试."""
from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

if TYPE_CHECKING:
    from app.models.skill import Skill
    from app.services.favorite_service import FavoriteService


class TestFavoriteService:
    """FavoriteService 测试类."""

    @pytest.fixture
    def favorite_service(self) -> FavoriteService:
        """创建 FavoriteService 实例."""
        from app.services.favorite_service import FavoriteService

        return FavoriteService()

    @pytest.fixture
    async def test_user(self, db_session: AsyncSession) -> dict:
        """创建测试用户（使用唯一标识避免冲突）."""
        from app.core.security import get_password_hash
        from app.models.user import User

        unique_id = str(uuid4())[:8]
        username = f"favuser_{unique_id}"
        email = f"favuser_{unique_id}@example.com"

        user = User(
            id=uuid4(),
            username=username,
            email=email,
            password_hash=get_password_hash("Test123!"),
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
    async def test_skill(self, db_session: AsyncSession, test_user: dict) -> Skill:
        """创建测试 Skill."""
        from app.models.skill import Skill

        skill = Skill(
            id=uuid4(),
            name="收藏测试 Skill",
            description="这是一个用于测试收藏功能的 Skill",
            usage_scenario="测试场景",
            usage_method="测试方法",
            tags=["test", "favorite"],
            author_id=test_user["id"],
            file_path="/test/fav_skill.zip",
            file_size=2048,
        )
        db_session.add(skill)
        await db_session.commit()
        await db_session.refresh(skill)
        return skill

    @pytest.mark.asyncio
    async def test_add_favorite(
        self,
        db_session: AsyncSession,
        favorite_service: FavoriteService,
        test_skill: Skill,
        test_user: dict,
    ) -> None:
        """测试添加收藏."""
        user_id = test_user["id"]

        favorite = await favorite_service.add_favorite(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )

        assert favorite is not None
        assert favorite.skill_id == test_skill.id
        assert favorite.user_id == user_id

    @pytest.mark.asyncio
    async def test_add_favorite_duplicate_returns_existing(
        self,
        db_session: AsyncSession,
        favorite_service: FavoriteService,
        test_skill: Skill,
        test_user: dict,
    ) -> None:
        """测试重复添加收藏返回已存在的记录."""
        from sqlmodel import select

        from app.models.favorite import Favorite

        user_id = test_user["id"]

        # 首次添加
        first = await favorite_service.add_favorite(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )

        # 再次添加（幂等操作）
        second = await favorite_service.add_favorite(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )

        assert first.user_id == second.user_id
        assert first.skill_id == second.skill_id

        # 验证只有一条记录
        result = await db_session.execute(
            select(Favorite).where(
                Favorite.skill_id == test_skill.id,
                Favorite.user_id == user_id,
            )
        )
        favorites = result.scalars().all()
        assert len(favorites) == 1

    @pytest.mark.asyncio
    async def test_remove_favorite(
        self,
        db_session: AsyncSession,
        favorite_service: FavoriteService,
        test_skill: Skill,
        test_user: dict,
    ) -> None:
        """测试取消收藏."""
        user_id = test_user["id"]

        # 先添加收藏
        await favorite_service.add_favorite(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )

        # 取消收藏
        result = await favorite_service.remove_favorite(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )

        assert result is True

    @pytest.mark.asyncio
    async def test_remove_favorite_not_exists(
        self,
        db_session: AsyncSession,
        favorite_service: FavoriteService,
        test_skill: Skill,
        test_user: dict,
    ) -> None:
        """测试取消不存在的收藏."""
        user_id = test_user["id"]

        # 取消不存在的收藏
        result = await favorite_service.remove_favorite(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )

        # 应该返回 False（未找到）
        assert result is False

    @pytest.mark.asyncio
    async def test_is_favorited(
        self,
        db_session: AsyncSession,
        favorite_service: FavoriteService,
        test_skill: Skill,
        test_user: dict,
    ) -> None:
        """测试检查收藏状态."""
        user_id = test_user["id"]

        # 未收藏时返回 False
        is_fav = await favorite_service.is_favorited(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )
        assert is_fav is False

        # 收藏后返回 True
        await favorite_service.add_favorite(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )

        is_fav = await favorite_service.is_favorited(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )
        assert is_fav is True

    @pytest.mark.asyncio
    async def test_get_favorite_count(
        self,
        db_session: AsyncSession,
        favorite_service: FavoriteService,
        test_user: dict,
    ) -> None:
        """测试获取收藏数."""
        from app.models.skill import Skill

        # 创建两个 Skill
        skill1 = Skill(
            id=uuid4(),
            name="Skill 1",
            description="Test skill 1",
            usage_scenario="Test",
            usage_method="Test",
            author_id=test_user["id"],
            file_path="/test/s1.zip",
            file_size=100,
        )
        skill2 = Skill(
            id=uuid4(),
            name="Skill 2",
            description="Test skill 2",
            usage_scenario="Test",
            usage_method="Test",
            author_id=test_user["id"],
            file_path="/test/s2.zip",
            file_size=100,
        )
        db_session.add_all([skill1, skill2])
        await db_session.commit()

        # 为 skill1 添加收藏
        await favorite_service.add_favorite(
            db_session,
            skill_id=skill1.id,
            user_id=test_user["id"],
        )

        count = await favorite_service.get_favorite_count(
            db_session,
            skill_id=skill1.id,
        )
        assert count == 1

        count = await favorite_service.get_favorite_count(
            db_session,
            skill_id=skill2.id,
        )
        assert count == 0

    @pytest.mark.asyncio
    async def test_toggle_favorite_add(
        self,
        db_session: AsyncSession,
        favorite_service: FavoriteService,
        test_skill: Skill,
        test_user: dict,
    ) -> None:
        """测试切换收藏状态（添加）."""
        user_id = test_user["id"]

        is_favorited, favorite = await favorite_service.toggle_favorite(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )

        assert is_favorited is True
        assert favorite is not None
        assert favorite.skill_id == test_skill.id

    @pytest.mark.asyncio
    async def test_toggle_favorite_remove(
        self,
        db_session: AsyncSession,
        favorite_service: FavoriteService,
        test_skill: Skill,
        test_user: dict,
    ) -> None:
        """测试切换收藏状态（取消）."""
        user_id = test_user["id"]

        # 先添加收藏
        await favorite_service.add_favorite(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )

        # 切换（取消）
        is_favorited, favorite = await favorite_service.toggle_favorite(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )

        assert is_favorited is False
        assert favorite is None
