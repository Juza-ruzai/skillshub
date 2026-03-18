"""评分服务测试."""
from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

if TYPE_CHECKING:
    from app.models.skill import Skill
    from app.models.user import User
    from app.services.rating_service import RatingService


class TestRatingService:
    """RatingService 测试类."""

    @pytest.fixture
    def rating_service(self) -> RatingService:
        """创建 RatingService 实例."""
        from app.services.rating_service import RatingService

        return RatingService()

    @pytest.fixture
    async def test_user(self, db_session: AsyncSession) -> dict:
        """创建测试用户（使用唯一标识避免冲突）."""
        from app.core.security import get_password_hash
        from app.models.user import User

        unique_id = str(uuid4())[:8]
        username = f"ratinguser_{unique_id}"
        email = f"ratinguser_{unique_id}@example.com"

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
    async def another_user(self, db_session: AsyncSession) -> User:
        """创建另一个测试用户."""
        from app.core.security import get_password_hash
        from app.models.user import User

        unique_id = str(uuid4())[:8]
        user = User(
            id=uuid4(),
            username=f"another_{unique_id}",
            email=f"another_{unique_id}@example.com",
            password_hash=get_password_hash("Test123!"),
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        return user

    @pytest.fixture
    async def test_skill(self, db_session: AsyncSession, test_user: dict) -> Skill:
        """创建测试 Skill."""
        from app.models.skill import Skill

        skill = Skill(
            id=uuid4(),
            name="测试 Skill",
            description="这是一个测试 Skill 的描述",
            usage_scenario="测试场景",
            usage_method="测试方法",
            tags=["test"],
            author_id=test_user["id"],
            file_path="/test/skill.zip",
            file_size=1024,
        )
        db_session.add(skill)
        await db_session.commit()
        await db_session.refresh(skill)
        return skill

    @pytest.mark.asyncio
    async def test_rate_skill_creates_new_rating(
        self,
        db_session: AsyncSession,
        rating_service: RatingService,
        test_skill: Skill,
        test_user: dict,
    ) -> None:
        """测试首次评分创建评分记录."""
        user_id = test_user["id"]

        rating = await rating_service.rate_skill(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
            score=5,
        )

        assert rating is not None
        assert rating.skill_id == test_skill.id
        assert rating.user_id == user_id
        assert rating.score == 5

    @pytest.mark.asyncio
    async def test_rate_skill_updates_existing_rating(
        self,
        db_session: AsyncSession,
        rating_service: RatingService,
        test_skill: Skill,
        test_user: dict,
    ) -> None:
        """测试更新已有评分."""
        from sqlmodel import select

        from app.models.rating import Rating

        user_id = test_user["id"]

        # 首次评分
        await rating_service.rate_skill(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
            score=3,
        )

        # 更新评分
        rating = await rating_service.rate_skill(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
            score=5,
        )

        assert rating.score == 5

        # 验证只有一条记录
        result = await db_session.execute(
            select(Rating).where(
                Rating.skill_id == test_skill.id,
                Rating.user_id == user_id,
            )
        )
        ratings = result.scalars().all()
        assert len(ratings) == 1

    @pytest.mark.asyncio
    async def test_rate_skill_validates_score_range(
        self,
        db_session: AsyncSession,
        rating_service: RatingService,
        test_skill: Skill,
        test_user: dict,
    ) -> None:
        """测试评分范围验证（1-5）."""
        user_id = test_user["id"]

        # 测试评分低于 1
        with pytest.raises(ValueError, match="评分必须在 1-5 之间"):
            await rating_service.rate_skill(
                db_session,
                skill_id=test_skill.id,
                user_id=user_id,
                score=0,
            )

        # 测试评分高于 5
        with pytest.raises(ValueError, match="评分必须在 1-5 之间"):
            await rating_service.rate_skill(
                db_session,
                skill_id=test_skill.id,
                user_id=user_id,
                score=6,
            )

    @pytest.mark.asyncio
    async def test_get_user_rating(
        self,
        db_session: AsyncSession,
        rating_service: RatingService,
        test_skill: Skill,
        test_user: dict,
    ) -> None:
        """测试获取用户评分."""
        user_id = test_user["id"]

        # 未评分时返回 None
        rating = await rating_service.get_user_rating(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )
        assert rating is None

        # 评分后返回评分
        await rating_service.rate_skill(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
            score=4,
        )

        rating = await rating_service.get_user_rating(
            db_session,
            skill_id=test_skill.id,
            user_id=user_id,
        )
        assert rating == 4

    @pytest.mark.asyncio
    async def test_get_rating_stats(
        self,
        db_session: AsyncSession,
        rating_service: RatingService,
        test_skill: Skill,
        test_user: dict,
        another_user: User,
    ) -> None:
        """测试获取评分统计."""
        # 添加多个评分
        await rating_service.rate_skill(
            db_session,
            skill_id=test_skill.id,
            user_id=test_user["id"],
            score=5,
        )
        await rating_service.rate_skill(
            db_session,
            skill_id=test_skill.id,
            user_id=another_user.id,
            score=3,
        )

        avg_score, count = await rating_service.get_rating_stats(
            db_session,
            skill_id=test_skill.id,
        )

        assert count == 2
        assert avg_score == Decimal("4.0")

    @pytest.mark.asyncio
    async def test_get_rating_stats_empty(
        self,
        db_session: AsyncSession,
        rating_service: RatingService,
        test_skill: Skill,
    ) -> None:
        """测试无评分时的统计."""
        avg_score, count = await rating_service.get_rating_stats(
            db_session,
            skill_id=test_skill.id,
        )

        assert count == 0
        assert avg_score == Decimal("0.0")
