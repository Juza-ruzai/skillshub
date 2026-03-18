"""收藏服务层 - 处理 Skill 收藏的业务逻辑."""
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.favorite import Favorite


class FavoriteService:
    """收藏服务类."""

    async def add_favorite(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
        user_id: UUID,
    ) -> Favorite:
        """添加收藏（幂等操作，已存在则返回现有记录）.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID
            user_id: 用户 ID

        Returns:
            Favorite 实例
        """
        # 检查是否已收藏
        result = await db_session.execute(
            select(Favorite).where(
                Favorite.skill_id == skill_id,
                Favorite.user_id == user_id,
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            return existing

        # 创建新收藏
        favorite = Favorite(
            skill_id=skill_id,
            user_id=user_id,
        )
        db_session.add(favorite)
        await db_session.commit()
        await db_session.refresh(favorite)
        return favorite

    async def remove_favorite(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
        user_id: UUID,
    ) -> bool:
        """取消收藏.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID
            user_id: 用户 ID

        Returns:
            是否成功删除（False 表示不存在）
        """
        result = await db_session.execute(
            select(Favorite).where(
                Favorite.skill_id == skill_id,
                Favorite.user_id == user_id,
            )
        )
        favorite = result.scalar_one_or_none()

        if not favorite:
            return False

        await db_session.delete(favorite)
        await db_session.commit()
        return True

    async def is_favorited(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
        user_id: UUID,
    ) -> bool:
        """检查用户是否收藏了 Skill.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID
            user_id: 用户 ID

        Returns:
            是否已收藏
        """
        result = await db_session.execute(
            select(Favorite).where(
                Favorite.skill_id == skill_id,
                Favorite.user_id == user_id,
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_favorite_count(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
    ) -> int:
        """获取 Skill 的收藏数.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID

        Returns:
            收藏数量
        """
        result = await db_session.execute(
            select(func.count(Favorite.skill_id)).where(
                Favorite.skill_id == skill_id
            )
        )
        count = result.scalar_one_or_none()
        return count or 0

    async def toggle_favorite(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
        user_id: UUID,
    ) -> tuple[bool, Favorite | None]:
        """切换收藏状态.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID
            user_id: 用户 ID

        Returns:
            (是否收藏, Favorite 实例或 None)
        """
        # 检查是否已收藏
        result = await db_session.execute(
            select(Favorite).where(
                Favorite.skill_id == skill_id,
                Favorite.user_id == user_id,
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            # 已收藏，取消收藏
            await db_session.delete(existing)
            await db_session.commit()
            return False, None
        else:
            # 未收藏，添加收藏
            favorite = Favorite(
                skill_id=skill_id,
                user_id=user_id,
            )
            db_session.add(favorite)
            await db_session.commit()
            await db_session.refresh(favorite)
            return True, favorite
