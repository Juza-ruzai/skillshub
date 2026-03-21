"""评论服务层 - 处理评论的业务逻辑."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import asc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import CommentWithReplies


class CommentService:
    """评论服务类."""

    async def create_comment(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
        user_id: UUID,
        content: str,
        parent_id: UUID | None = None,
    ) -> Comment:
        """创建评论或回复.

        Args:
            db_session: 数据库会话
            skill_id: Skill ID
            user_id: 用户 ID
            content: 评论内容
            parent_id: 父评论 ID（回复时填写）

        Returns:
            Comment 实例
        """
        comment = Comment(
            skill_id=skill_id,
            user_id=user_id,
            content=content,
            parent_id=parent_id,
        )
        db_session.add(comment)
        await db_session.commit()
        await db_session.refresh(comment)
        return comment

    async def get_comments_by_skill(
        self,
        db_session: AsyncSession,
        skill_id: UUID,
    ) -> list[CommentWithReplies]:
        """获取 Skill 的评论（嵌套结构）.

        只返回主评论，回复嵌套在 replies 字段中。

        Args:
            db_session: 数据库会话
            skill_id: Skill ID

        Returns:
            主评论列表（包含嵌套回复）
        """
        # 获取所有评论（主评论 + 回复）
        result = await db_session.execute(
            select(Comment)
            .where(Comment.skill_id == skill_id, Comment.is_deleted == False)  # noqa: E712
            .order_by(asc(Comment.created_at))
        )
        all_comments = result.scalars().all()

        # 批量获取用户名
        user_ids = {comment.user_id for comment in all_comments}
        username_map: dict[UUID, str] = {}
        if user_ids:
            user_result = await db_session.execute(
                select(User.id, User.username).where(User.id.in_(user_ids))  # type: ignore[attr-defined]
            )
            username_map = dict(user_result.all())

        # 构建 ID -> Comment 映射
        comment_map: dict[UUID, CommentWithReplies] = {}
        for comment in all_comments:
            comment_data = CommentWithReplies.model_validate(comment)
            comment_data.username = username_map.get(comment.user_id, "未知用户")
            comment_map[comment.id] = comment_data

        # 构建嵌套结构
        main_comments: list[CommentWithReplies] = []
        for comment in all_comments:
            comment_with_replies = comment_map[comment.id]
            if comment.parent_id is None:
                # 主评论
                main_comments.append(comment_with_replies)
            else:
                # 回复，添加到父评论的 replies 中
                if comment.parent_id in comment_map:
                    parent = comment_map[comment.parent_id]
                    parent.replies.append(comment_with_replies)

        return main_comments

    async def delete_comment(
        self,
        db_session: AsyncSession,
        comment_id: UUID,
        user_id: UUID,
        is_admin: bool = False,
    ) -> None:
        """软删除评论.

        Args:
            db_session: 数据库会话
            comment_id: 评论 ID
            user_id: 当前用户 ID
            is_admin: 是否管理员

        Raises:
            ValueError: 评论不存在
            PermissionError: 无权删除
        """
        result = await db_session.execute(select(Comment).where(Comment.id == comment_id))
        comment = result.scalar_one_or_none()

        if comment is None:
            raise ValueError("评论不存在")

        if comment.user_id != user_id and not is_admin:
            raise PermissionError("无权删除此评论")

        comment.is_deleted = True
        comment.updated_at = datetime.now(UTC)
        await db_session.commit()
