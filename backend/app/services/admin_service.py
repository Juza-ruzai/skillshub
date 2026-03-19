"""Admin 服务层."""
import csv
import io
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.comment import Comment
from app.models.download_log import DownloadLog
from app.models.skill import Skill
from app.models.tag import Tag
from app.models.user import User


class AdminService:
    """管理员服务类."""

    def __init__(self, db: AsyncSession) -> None:
        """初始化服务.

        Args:
            db: 数据库会话
        """
        self.db = db

    async def update_skill(
        self,
        skill_id: UUID,
        name: str,
        description: str,
        usage_scenario: str,
        usage_method: str,
        tags: list[str],
    ) -> Skill | None:
        """更新任意 Skill.

        Args:
            skill_id: Skill ID
            name: 名称
            description: 描述
            usage_scenario: 使用场景
            usage_method: 使用方法
            tags: 标签列表

        Returns:
            更新后的 Skill，不存在返回 None
        """
        result = await self.db.execute(select(Skill).where(Skill.id == skill_id))
        skill = result.scalar_one_or_none()

        if not skill:
            return None

        skill.name = name
        skill.description = description
        skill.usage_scenario = usage_scenario
        skill.usage_method = usage_method
        skill.tags = tags
        skill.updated_at = datetime.now(UTC)

        await self.db.commit()
        await self.db.refresh(skill)

        return skill

    async def force_delete_skill(self, skill_id: UUID) -> bool:
        """强制删除 Skill（物理删除）.

        Args:
            skill_id: Skill ID

        Returns:
            删除成功返回 True，不存在返回 False
        """
        result = await self.db.execute(select(Skill).where(Skill.id == skill_id))
        skill = result.scalar_one_or_none()

        if not skill:
            return False

        await self.db.delete(skill)
        await self.db.commit()

        return True

    async def list_deleted_skills(
        self,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Skill], int]:
        """获取软删除 Skill 列表.

        Args:
            skip: 跳过数量
            limit: 限制数量

        Returns:
            (Skill 列表, 总数)
        """
        result = await self.db.execute(
            select(Skill)
            .where(Skill.is_deleted == True)  # noqa: E712
            .order_by(Skill.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        skills = list(result.scalars().all())

        count_result = await self.db.execute(
            select(func.count()).select_from(Skill).where(Skill.is_deleted == True)  # noqa: E712
        )
        total = count_result.scalar() or 0

        return skills, total

    async def restore_skill(self, skill_id: UUID) -> Skill | None:
        """恢复软删除的 Skill.

        Args:
            skill_id: Skill ID

        Returns:
            恢复后的 Skill，不存在或未被删除返回 None
        """
        result = await self.db.execute(select(Skill).where(Skill.id == skill_id))
        skill = result.scalar_one_or_none()

        if not skill or not skill.is_deleted:
            return None

        skill.is_deleted = False
        skill.updated_at = datetime.now(UTC)
        await self.db.commit()
        await self.db.refresh(skill)

        return skill

    async def get_skill_downloads(
        self,
        skill_id: UUID,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[DownloadLog], int]:
        """获取 Skill 下载用户列表.

        Args:
            skill_id: Skill ID
            skip: 跳过数量
            limit: 限制数量

        Returns:
            (下载记录列表, 总数)
        """
        result = await self.db.execute(
            select(DownloadLog)
            .where(DownloadLog.skill_id == skill_id)
            .order_by(DownloadLog.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        logs = list(result.scalars().all())

        count_result = await self.db.execute(
            select(func.count()).select_from(DownloadLog).where(DownloadLog.skill_id == skill_id)
        )
        total = count_result.scalar() or 0

        return logs, total

    async def list_users(
        self,
        search: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[User], int]:
        """获取用户列表.

        Args:
            search: 搜索关键词
            skip: 跳过数量
            limit: 限制数量

        Returns:
            (用户列表, 总数)
        """
        query = select(User)

        if search:
            query = query.where(
                (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
            )

        # 获取总数
        count_query = select(func.count()).select_from(User)
        if search:
            count_query = count_query.where(
                (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
            )
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # 获取用户列表
        result = await self.db.execute(
            query.order_by(User.created_at.desc()).offset(skip).limit(limit)
        )
        users = list(result.scalars().all())

        return users, total

    async def set_user_admin_status(self, user_id: UUID, is_admin: bool) -> User | None:
        """设置用户管理员权限.

        Args:
            user_id: 用户 ID
            is_admin: 是否为管理员

        Returns:
            更新后的用户，不存在返回 None
        """
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            return None

        user.is_admin = is_admin
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def set_user_active_status(self, user_id: UUID, is_active: bool) -> User | None:
        """设置用户活跃状态.

        Args:
            user_id: 用户 ID
            is_active: 是否活跃

        Returns:
            更新后的用户，不存在返回 None
        """
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            return None

        user.is_active = is_active
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def list_comments(
        self,
        skill_id: UUID | None = None,
        is_deleted: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[tuple[Comment, User, Skill]], int]:
        """获取评论列表.

        Args:
            skill_id: 按 Skill ID 筛选
            is_deleted: 按删除状态筛选
            skip: 跳过数量
            limit: 限制数量

        Returns:
            (评论列表, 总数)
        """
        query = select(Comment, User, Skill).join(User, Comment.user_id == User.id).join(Skill, Comment.skill_id == Skill.id)

        if skill_id:
            query = query.where(Comment.skill_id == skill_id)

        if is_deleted is not None:
            query = query.where(Comment.is_deleted == is_deleted)

        # 获取总数
        count_query = select(func.count()).select_from(Comment)
        if skill_id:
            count_query = count_query.where(Comment.skill_id == skill_id)
        if is_deleted is not None:
            count_query = count_query.where(Comment.is_deleted == is_deleted)
        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # 获取评论列表
        result = await self.db.execute(
            query.order_by(Comment.created_at.desc()).offset(skip).limit(limit)
        )
        comments = list(result.all())

        return comments, total

    async def get_overview_stats(self) -> dict[str, int]:
        """获取平台概览统计.

        Returns:
            统计数据字典
        """
        # 总 Skills 数
        skills_result = await self.db.execute(
            select(func.count()).select_from(Skill).where(Skill.is_deleted == False)  # noqa: E712
        )
        total_skills = skills_result.scalar() or 0

        # 总用户数
        users_result = await self.db.execute(select(func.count()).select_from(User))
        total_users = users_result.scalar() or 0

        # 今日开始时间
        today = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)

        # 今日下载数
        today_downloads_result = await self.db.execute(
            select(func.count()).select_from(DownloadLog).where(DownloadLog.created_at >= today)
        )
        today_downloads = today_downloads_result.scalar() or 0

        # 今日评论数
        today_comments_result = await self.db.execute(
            select(func.count()).select_from(Comment).where(Comment.created_at >= today)
        )
        today_comments = today_comments_result.scalar() or 0

        # 今日上传数
        today_uploads_result = await self.db.execute(
            select(func.count()).select_from(Skill).where(Skill.created_at >= today)
        )
        today_uploads = today_uploads_result.scalar() or 0

        return {
            "total_skills": total_skills,
            "total_users": total_users,
            "today_downloads": today_downloads,
            "today_comments": today_comments,
            "today_uploads": today_uploads,
        }

    async def get_active_users(self, days: int = 30, limit: int = 20) -> list[dict[str, Any]]:
        """获取活跃用户榜单.

        Args:
            days: 统计天数
            limit: 返回数量

        Returns:
            活跃用户列表
        """
        since = datetime.now(UTC) - timedelta(days=days)

        result = await self.db.execute(
            select(
                User.id,
                User.username,
                func.count(func.distinct(DownloadLog.id)).label("download_count"),
                func.count(func.distinct(Comment.id)).label("comment_count"),
                func.count(func.distinct(Skill.id)).label("upload_count"),
            )
            .outerjoin(DownloadLog, (DownloadLog.user_id == User.id) & (DownloadLog.created_at >= since))
            .outerjoin(Comment, (Comment.user_id == User.id) & (Comment.created_at >= since))
            .outerjoin(Skill, (Skill.author_id == User.id) & (Skill.created_at >= since))
            .group_by(User.id, User.username)
            .order_by((func.count(func.distinct(DownloadLog.id)) + func.count(func.distinct(Comment.id)) + func.count(func.distinct(Skill.id))).desc())
            .limit(limit)
        )
        users = result.all()

        return [
            {
                "user_id": str(user.id),
                "username": user.username,
                "download_count": user.download_count,
                "comment_count": user.comment_count,
                "upload_count": user.upload_count,
                "total_score": user.download_count + user.comment_count + user.upload_count,
            }
            for user in users
        ]

    async def export_users_csv(self) -> str:
        """导出用户 CSV.

        Returns:
            CSV 内容字符串
        """
        result = await self.db.execute(select(User).order_by(User.created_at.desc()))
        users = result.scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["id", "username", "email", "is_admin", "is_active", "created_at"])

        for user in users:
            writer.writerow([
                str(user.id),
                user.username,
                user.email,
                user.is_admin,
                user.is_active,
                user.created_at.isoformat() if user.created_at else "",
            ])

        output.seek(0)
        return output.getvalue()

    async def export_tags_csv(self) -> str:
        """导出标签 CSV.

        Returns:
            CSV 内容字符串
        """
        result = await self.db.execute(select(Tag).order_by(Tag.usage_count.desc()))
        tags = result.scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["id", "name", "usage_count", "created_at"])

        for tag in tags:
            writer.writerow([
                str(tag.id),
                tag.name,
                tag.usage_count,
                tag.created_at.isoformat() if tag.created_at else "",
            ])

        output.seek(0)
        return output.getvalue()
