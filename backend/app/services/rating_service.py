"""评分服务层 - 处理 Skill 评分的业务逻辑."""
from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.rating import Rating


class RatingService:
    """评分服务类."""

    async def rate_skill(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
        user_id: UUID,
        score: int,
    ) -> Rating:
        """为 Skill 评分（首次或更新）.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID
            user_id: 用户 ID
            score: 评分（1-5）

        Returns:
            Rating 实例

        Raises:
            ValueError: 评分不在 1-5 范围内
        """
        # 验证评分范围
        if score < 1 or score > 5:
            raise ValueError("评分必须在 1-5 之间")

        # 查找现有评分
        result = await db_session.execute(
            select(Rating).where(
                Rating.skill_id == skill_id,
                Rating.user_id == user_id,
            )
        )
        existing_rating = result.scalar_one_or_none()

        if existing_rating:
            # 更新评分
            existing_rating.score = score
            await db_session.commit()
            await db_session.refresh(existing_rating)
            return existing_rating
        else:
            # 创建新评分
            rating = Rating(
                skill_id=skill_id,
                user_id=user_id,
                score=score,
            )
            db_session.add(rating)
            await db_session.commit()
            await db_session.refresh(rating)
            return rating

    async def get_user_rating(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
        user_id: UUID,
    ) -> int | None:
        """获取用户对 Skill 的评分.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID
            user_id: 用户 ID

        Returns:
            评分（1-5）或 None（未评分）
        """
        result = await db_session.execute(
            select(Rating.score).where(
                Rating.skill_id == skill_id,
                Rating.user_id == user_id,
            )
        )
        score = result.scalar_one_or_none()
        return score

    async def get_rating_stats(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
    ) -> tuple[Decimal, int]:
        """获取 Skill 的评分统计.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID

        Returns:
            (平均评分, 评分人数)
        """
        result = await db_session.execute(
            select(func.avg(Rating.score), func.count(Rating.score)).where(
                Rating.skill_id == skill_id
            )
        )
        row = result.one_or_none()

        if row is None or row[1] == 0:
            return Decimal("0.0"), 0

        avg_score = Decimal(str(row[0])).quantize(Decimal("0.1"))
        count = row[1]

        return avg_score, count
