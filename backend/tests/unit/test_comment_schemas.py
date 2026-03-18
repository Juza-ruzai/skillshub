"""Comment Schema 单元测试."""
from uuid import uuid4

import pytest
from pydantic import ValidationError


class TestCommentCreate:
    """测试 CommentCreate Schema."""

    def test_valid_comment(self) -> None:
        """测试有效评论."""
        from app.schemas.comment import CommentCreate

        comment = CommentCreate(content="这是一条评论")
        assert comment.content == "这是一条评论"

    def test_content_required(self) -> None:
        """测试内容必填."""
        from app.schemas.comment import CommentCreate

        with pytest.raises(ValidationError) as exc_info:
            CommentCreate()  # type: ignore[call-arg]

        assert "content" in str(exc_info.value)

    def test_content_min_length(self) -> None:
        """测试内容最小长度为 1."""
        from app.schemas.comment import CommentCreate

        with pytest.raises(ValidationError) as exc_info:
            CommentCreate(content="")

        assert "at least 1 character" in str(exc_info.value).lower()

    def test_content_max_length(self) -> None:
        """测试内容最大长度为 2000."""
        from app.schemas.comment import CommentCreate

        with pytest.raises(ValidationError) as exc_info:
            CommentCreate(content="a" * 2001)

        assert "at most 2000 characters" in str(exc_info.value).lower()

    def test_parent_id_optional(self) -> None:
        """测试 parent_id 可选."""
        from app.schemas.comment import CommentCreate

        comment = CommentCreate(content="回复评论", parent_id=uuid4())
        assert comment.parent_id is not None

        comment_no_parent = CommentCreate(content="主评论")
        assert comment_no_parent.parent_id is None


class TestCommentResponse:
    """测试 CommentResponse Schema."""

    def test_from_model(self) -> None:
        """测试从模型创建响应."""
        from datetime import datetime
        from uuid import uuid4

        from app.schemas.comment import CommentResponse

        # 模拟 ORM 对象
        class MockComment:
            id = uuid4()
            skill_id = uuid4()
            user_id = uuid4()
            content = "测试评论"
            parent_id = None
            is_deleted = False
            created_at = datetime.now()
            updated_at = datetime.now()

        response = CommentResponse.model_validate(MockComment())
        assert response.content == "测试评论"
        assert response.parent_id is None


class TestCommentWithReplies:
    """测试 CommentWithReplies Schema（嵌套回复）."""

    def test_with_empty_replies(self) -> None:
        """测试无回复的评论."""
        from datetime import datetime
        from uuid import uuid4

        from app.schemas.comment import CommentWithReplies

        class MockComment:
            id = uuid4()
            skill_id = uuid4()
            user_id = uuid4()
            content = "主评论"
            parent_id = None
            is_deleted = False
            created_at = datetime.now()
            updated_at = datetime.now()

        response = CommentWithReplies.model_validate(MockComment())
        assert response.replies == []

    def test_with_nested_replies(self) -> None:
        """测试带嵌套回复的评论."""
        from datetime import datetime
        from uuid import uuid4

        from app.schemas.comment import CommentResponse, CommentWithReplies

        skill_id = uuid4()
        user_id = uuid4()
        comment_id = uuid4()

        # 创建回复
        reply = CommentResponse(
            id=uuid4(),
            skill_id=skill_id,
            user_id=user_id,
            content="回复内容",
            parent_id=comment_id,
            is_deleted=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        # 创建带回复的主评论
        response = CommentWithReplies(
            id=comment_id,
            skill_id=skill_id,
            user_id=user_id,
            content="主评论",
            parent_id=None,
            is_deleted=False,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            replies=[reply],
        )
        assert len(response.replies) == 1
        assert response.replies[0].content == "回复内容"
