"""Comment Service 单元测试."""
from uuid import uuid4

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.comment import Comment
from app.models.skill import Skill
from app.models.user import User
from app.services.comment_service import CommentService


class TestCommentServiceCreateComment:
    """测试创建评论."""

    @pytest.fixture
    async def setup_data(self, db_session: AsyncSession) -> tuple[User, Skill]:
        """创建测试数据."""
        user = User(
            username=f"user_{uuid4().hex[:8]}",
            email=f"{uuid4().hex[:8]}@test.com",
            password_hash="hashed_password",
        )
        db_session.add(user)
        await db_session.flush()

        skill = Skill(
            name="Test Skill",
            description="Test description",
            usage_scenario="Test scenario",
            usage_method="Test method",
            file_path="/test/path",
            file_size=1024,
            author_id=user.id,
        )
        db_session.add(skill)
        await db_session.flush()

        return user, skill

    async def test_create_main_comment(
        self, db_session: AsyncSession, setup_data: tuple[User, Skill]
    ) -> None:
        """测试创建主评论."""
        user, skill = setup_data
        service = CommentService()

        comment = await service.create_comment(
            db_session=db_session,
            skill_id=skill.id,
            user_id=user.id,
            content="这是一条测试评论",
        )

        assert comment.id is not None
        assert comment.content == "这是一条测试评论"
        assert comment.skill_id == skill.id
        assert comment.user_id == user.id
        assert comment.parent_id is None
        assert comment.is_deleted is False

    async def test_create_reply(
        self, db_session: AsyncSession, setup_data: tuple[User, Skill]
    ) -> None:
        """测试创建回复."""
        user, skill = setup_data
        service = CommentService()

        # 先创建主评论
        main_comment = await service.create_comment(
            db_session=db_session,
            skill_id=skill.id,
            user_id=user.id,
            content="主评论",
        )

        # 创建回复
        reply = await service.create_comment(
            db_session=db_session,
            skill_id=skill.id,
            user_id=user.id,
            content="这是一条回复",
            parent_id=main_comment.id,
        )

        assert reply.parent_id == main_comment.id
        assert reply.content == "这是一条回复"


class TestCommentServiceGetComments:
    """测试获取评论."""

    @pytest.fixture
    async def setup_data(self, db_session: AsyncSession) -> tuple[User, Skill]:
        """创建测试数据."""
        user = User(
            username=f"user_{uuid4().hex[:8]}",
            email=f"{uuid4().hex[:8]}@test.com",
            password_hash="hashed_password",
        )
        db_session.add(user)
        await db_session.flush()

        skill = Skill(
            name="Test Skill",
            description="Test description",
            usage_scenario="Test scenario",
            usage_method="Test method",
            file_path="/test/path",
            file_size=1024,
            author_id=user.id,
        )
        db_session.add(skill)
        await db_session.flush()

        return user, skill

    async def test_get_comments_by_skill_empty(
        self, db_session: AsyncSession
    ) -> None:
        """测试获取空评论列表."""
        service = CommentService()

        # 使用随机 skill_id
        comments = await service.get_comments_by_skill(
            db_session=db_session,
            skill_id=uuid4(),
        )

        assert comments == []

    async def test_get_comments_with_nested_replies(
        self, db_session: AsyncSession, setup_data: tuple[User, Skill]
    ) -> None:
        """测试获取嵌套回复结构."""
        user, skill = setup_data
        service = CommentService()

        # 创建主评论
        main_comment = await service.create_comment(
            db_session=db_session,
            skill_id=skill.id,
            user_id=user.id,
            content="主评论",
        )

        # 创建两条回复
        await service.create_comment(
            db_session=db_session,
            skill_id=skill.id,
            user_id=user.id,
            content="回复1",
            parent_id=main_comment.id,
        )
        await service.create_comment(
            db_session=db_session,
            skill_id=skill.id,
            user_id=user.id,
            content="回复2",
            parent_id=main_comment.id,
        )

        # 获取评论
        comments = await service.get_comments_by_skill(
            db_session=db_session,
            skill_id=skill.id,
        )

        # 应该只返回主评论（不包含回复作为单独项）
        assert len(comments) == 1
        assert comments[0].content == "主评论"
        assert len(comments[0].replies) == 2


class TestCommentServiceDeleteComment:
    """测试删除评论."""

    @pytest.fixture
    async def setup_data(self, db_session: AsyncSession) -> tuple[User, Skill]:
        """创建测试数据."""
        user = User(
            username=f"user_{uuid4().hex[:8]}",
            email=f"{uuid4().hex[:8]}@test.com",
            password_hash="hashed_password",
        )
        db_session.add(user)
        await db_session.flush()

        skill = Skill(
            name="Test Skill",
            description="Test description",
            usage_scenario="Test scenario",
            usage_method="Test method",
            file_path="/test/path",
            file_size=1024,
            author_id=user.id,
        )
        db_session.add(skill)
        await db_session.flush()

        return user, skill

    async def test_delete_own_comment(
        self, db_session: AsyncSession, setup_data: tuple[User, Skill]
    ) -> None:
        """测试删除自己的评论（软删除）."""
        user, skill = setup_data
        service = CommentService()

        comment = await service.create_comment(
            db_session=db_session,
            skill_id=skill.id,
            user_id=user.id,
            content="要删除的评论",
        )

        # 删除评论
        await service.delete_comment(
            db_session=db_session,
            comment_id=comment.id,
            user_id=user.id,
        )

        # 验证软删除
        result = await db_session.execute(
            select(Comment.is_deleted).where(Comment.id == comment.id)
        )
        is_deleted = result.scalar_one()
        assert is_deleted is True

    async def test_delete_other_user_comment_fails(
        self, db_session: AsyncSession, setup_data: tuple[User, Skill]
    ) -> None:
        """测试删除他人评论失败."""
        user, skill = setup_data
        service = CommentService()

        # 创建另一个用户
        other_user = User(
            username=f"other_{uuid4().hex[:8]}",
            email=f"other_{uuid4().hex[:8]}@test.com",
            password_hash="hashed_password",
        )
        db_session.add(other_user)
        await db_session.flush()

        comment = await service.create_comment(
            db_session=db_session,
            skill_id=skill.id,
            user_id=user.id,
            content="其他用户的评论",
        )

        # 尝试用其他用户删除
        with pytest.raises(PermissionError, match="无权删除此评论"):
            await service.delete_comment(
                db_session=db_session,
                comment_id=comment.id,
                user_id=other_user.id,
            )

    async def test_delete_nonexistent_comment(
        self, db_session: AsyncSession
    ) -> None:
        """测试删除不存在的评论."""
        service = CommentService()

        with pytest.raises(ValueError, match="评论不存在"):
            await service.delete_comment(
                db_session=db_session,
                comment_id=uuid4(),
                user_id=uuid4(),
            )

    async def test_admin_can_delete_any_comment(
        self, db_session: AsyncSession, setup_data: tuple[User, Skill]
    ) -> None:
        """测试管理员可以删除任意评论."""
        user, skill = setup_data
        service = CommentService()

        comment = await service.create_comment(
            db_session=db_session,
            skill_id=skill.id,
            user_id=user.id,
            content="管理员要删除的评论",
        )

        # 创建管理员用户
        admin_user = User(
            username=f"admin_{uuid4().hex[:8]}",
            email=f"admin_{uuid4().hex[:8]}@test.com",
            password_hash="hashed_password",
            is_admin=True,
        )
        db_session.add(admin_user)
        await db_session.flush()

        # 管理员删除评论
        await service.delete_comment(
            db_session=db_session,
            comment_id=comment.id,
            user_id=admin_user.id,
            is_admin=True,
        )

        # 验证软删除
        result = await db_session.execute(
            select(Comment.is_deleted).where(Comment.id == comment.id)
        )
        is_deleted = result.scalar_one()
        assert is_deleted is True
