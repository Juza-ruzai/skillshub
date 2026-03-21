"""Skill 服务层 - 处理 Skill 的业务逻辑."""

from datetime import UTC, datetime, timedelta
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import String, cast, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select as sqlmodel_select

from app.models.favorite import Favorite
from app.models.skill import Skill


def calculate_hot_score(skill: Skill, favorite_count: int = 0) -> int:
    """计算 Skill 热度分数.

    公式: (评分 × 20) + (下载数 × 2) + (收藏数 × 5)

    Args:
        skill: Skill 模型实例
        favorite_count: 收藏数（需调用方传入）

    Returns:
        热度分数
    """
    rating_score = float(skill.rating_avg or 0) * 20
    download_score = (skill.download_count or 0) * 2
    favorite_score = favorite_count * 5

    return int(rating_score + download_score + favorite_score)


class SkillService:
    """Skill 服务类."""

    async def create_skill(
        self,
        db_session: AsyncSession,
        skill_data: dict[str, Any],
        author_id: UUID,
        file_path: str,
        file_size: int,
    ) -> Skill:
        """创建新 Skill.

        Args:
            db_session: 数据库会话
            skill_data: Skill 数据
            author_id: 作者 ID
            file_path: 文件路径
            file_size: 文件大小

        Returns:
            创建的 Skill 实例
        """
        skill = Skill(
            name=skill_data["name"],
            description=skill_data["description"],
            usage_scenario=skill_data["usage_scenario"],
            usage_method=skill_data["usage_method"],
            tags=skill_data.get("tags", []),
            author_id=author_id,
            file_path=file_path,
            file_size=file_size,
        )

        db_session.add(skill)
        await db_session.commit()
        await db_session.refresh(skill)

        return skill

    async def get_skill_by_id(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
        include_deleted: bool = False,
    ) -> Skill | None:
        """通过 ID 获取 Skill.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID
            include_deleted: 是否包含已删除的 Skill

        Returns:
            Skill 实例或 None
        """
        query = sqlmodel_select(Skill).where(Skill.id == skill_id)

        if not include_deleted:
            query = query.where(Skill.is_deleted == False)  # noqa: E712

        result = await db_session.execute(query)
        return result.scalar_one_or_none()

    async def update_skill(
        self,
        db_session: AsyncSession,
        skill: Skill,
        update_data: dict[str, Any],
    ) -> Skill:
        """更新 Skill.

        Args:
            db_session: 数据库会话
            skill: Skill 实例
            update_data: 更新数据

        Returns:
            更新后的 Skill 实例
        """
        # 更新字段
        for field, value in update_data.items():
            if hasattr(skill, field) and value is not None:
                setattr(skill, field, value)

        # 更新时间
        skill.updated_at = datetime.now(UTC).replace(tzinfo=None)

        await db_session.commit()
        await db_session.refresh(skill)

        return skill

    async def delete_skill(
        self,
        db_session: AsyncSession,
        skill: Skill,
    ) -> bool:
        """软删除 Skill.

        Args:
            db_session: 数据库会话
            skill: Skill 实例

        Returns:
            是否成功删除
        """
        skill.is_deleted = True
        skill.updated_at = datetime.now(UTC).replace(tzinfo=None)

        await db_session.commit()

        return True

    async def search_skills(
        self,
        db_session: AsyncSession,
        search: str | None = None,
        tag: str | None = None,
        sort_by: str = "hot_score",
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Skill], int]:
        """搜索和筛选 Skills.

        Args:
            db_session: 数据库会话
            search: 搜索关键词
            tag: 标签筛选
            sort_by: 排序字段
            page: 页码
            page_size: 每页数量

        Returns:
            (Skill 列表, 总数)
        """
        # 基础查询：未删除的 Skills
        query = sqlmodel_select(Skill).where(Skill.is_deleted == False)  # noqa: E712

        # 搜索条件
        if search:
            search_filter = or_(
                Skill.name.ilike(f"%{search}%"),
                Skill.description.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)

        # 标签筛选：cast JSON 列为字符串后做 LIKE 匹配
        if tag:
            tag_lower = tag.lower()
            query = query.where(cast(Skill.tags, String).ilike(f'%"{tag_lower}"%'))

        # 获取总数
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db_session.execute(count_query)
        total = total_result.scalar() or 0

        # 排序
        if sort_by == "created_at":
            query = query.order_by(desc(Skill.created_at))
        elif sort_by == "rating":
            query = query.order_by(desc(Skill.rating_avg))
        elif sort_by == "download_count":
            query = query.order_by(desc(Skill.download_count))
        else:  # hot_score
            # 收藏数子查询
            fav_subq = (
                select(Favorite.skill_id, func.count(Favorite.user_id).label("fav_cnt"))
                .group_by(Favorite.skill_id)
                .subquery()
            )
            # 热度公式：(评分×20) + (下载数×2) + (收藏数×5)
            hot_score_expr = (
                Skill.rating_avg * 20
                + Skill.download_count * 2
                + func.coalesce(fav_subq.c.fav_cnt, 0) * 5
            )
            query = query.outerjoin(fav_subq, Skill.id == fav_subq.c.skill_id)
            query = query.order_by(desc(hot_score_expr), desc(Skill.created_at))

        # 分页
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await db_session.execute(query)
        skills = list(result.scalars().all())

        return skills, total

    async def increment_download_count(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
    ) -> None:
        """增加下载计数.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID
        """
        skill = await self.get_skill_by_id(db_session, skill_id)
        if skill:
            skill.download_count += 1
            await db_session.commit()

    async def increment_view_count(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
    ) -> None:
        """增加浏览计数.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID
        """
        skill = await self.get_skill_by_id(db_session, skill_id)
        if skill:
            skill.view_count += 1
            await db_session.commit()

    async def get_trending_skills(
        self,
        db_session: AsyncSession,
        limit: int = 10,
    ) -> list[Skill]:
        """获取本周热门 Skills（最近 7 天创建且下载量高）.

        Args:
            db_session: 数据库会话
            limit: 返回数量

        Returns:
            Skill 列表
        """
        # 最近 7 天（使用 naive datetime 匹配数据库类型）
        week_ago = datetime.now(UTC) - timedelta(days=7)
        week_ago = week_ago.replace(tzinfo=None)

        query = (
            sqlmodel_select(Skill)
            .where(Skill.is_deleted == False)  # noqa: E712
            .where(Skill.created_at >= week_ago)
            .order_by(desc(Skill.download_count))
            .limit(limit)
        )

        result = await db_session.execute(query)
        return list(result.scalars().all())

    async def get_top_rated_skills(
        self,
        db_session: AsyncSession,
        limit: int = 10,
    ) -> list[Skill]:
        """获取评分最高 Skills（最少 3 人评分）.

        Args:
            db_session: 数据库会话
            limit: 返回数量

        Returns:
            Skill 列表
        """
        query = (
            sqlmodel_select(Skill)
            .where(Skill.is_deleted == False)  # noqa: E712
            .where(Skill.rating_count >= 3)
            .order_by(desc(Skill.rating_avg))
            .limit(limit)
        )

        result = await db_session.execute(query)
        return list(result.scalars().all())

    async def get_most_downloaded_skills(
        self,
        db_session: AsyncSession,
        limit: int = 10,
    ) -> list[Skill]:
        """获取下载最多 Skills.

        Args:
            db_session: 数据库会话
            limit: 返回数量

        Returns:
            Skill 列表
        """
        query = (
            sqlmodel_select(Skill)
            .where(Skill.is_deleted == False)  # noqa: E712
            .order_by(desc(Skill.download_count))
            .limit(limit)
        )

        result = await db_session.execute(query)
        return list(result.scalars().all())

    async def update_rating_stats(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
    ) -> None:
        """更新 Skill 的评分统计.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID
        """
        from app.models.rating import Rating

        # 计算平均评分
        query = select(func.avg(Rating.score), func.count(Rating.score)).where(
            Rating.skill_id == skill_id
        )
        result = await db_session.execute(query)
        avg_score, count = result.one_or_none() or (0, 0)

        skill = await self.get_skill_by_id(db_session, skill_id)
        if skill:
            skill.rating_avg = Decimal(str(avg_score or 0)).quantize(Decimal("0.1"))
            skill.rating_count = count
            await db_session.commit()
