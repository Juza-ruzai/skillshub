"""评论 API 集成测试."""
from uuid import uuid4

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.skill import Skill
from app.models.user import User


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """创建测试用户."""
    unique_id = uuid4().hex[:8]
    user = User(
        username=f"commenter_{unique_id}",
        email=f"commenter_{unique_id}@test.com",
        password_hash="hashed_password",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
async def test_skill(db_session: AsyncSession, test_user: User) -> Skill:
    """创建测试 Skill."""
    skill = Skill(
        name="Test Skill for Comments",
        description="A test skill for comment testing",
        usage_scenario="Testing comments",
        usage_method="Use for testing",
        file_path="/test/path",
        file_size=1024,
        author_id=test_user.id,
    )
    db_session.add(skill)
    await db_session.commit()
    await db_session.refresh(skill)
    return skill


@pytest.fixture
async def auth_headers(client: AsyncClient, test_user: User) -> dict[str, str]:
    """获取认证头 - 使用 test_user fixture 的用户."""
    # test_user 已通过 fixture 创建，但需要正确的密码来登录
    # 由于密码哈希是固定的，我们需要直接使用已创建的用户
    # 实际上测试环境应该用 mock 的密码验证
    # 这里我们采用另一种方式：注册一个新用户用于 API 测试

    unique_id = uuid4().hex[:8]
    register_response = await client.post(
        "/api/v1/auth/register",
        json={
            "username": f"api_user_{unique_id}",
            "email": f"api_user_{unique_id}@test.com",
            "password": "TestPass123!",
        },
    )
    assert register_response.status_code == 201

    login_response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": f"api_user_{unique_id}@test.com",
            "password": "TestPass123!",
        },
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}


class TestCommentsAPI:
    """评论 API 测试."""

    async def test_get_comments_empty(
        self, client: AsyncClient, test_skill: Skill
    ) -> None:
        """测试获取空评论列表."""
        response = await client.get(f"/api/v1/skills/{test_skill.id}/comments")

        assert response.status_code == 200
        assert response.json() == []

    async def test_create_main_comment(
        self,
        client: AsyncClient,
        test_skill: Skill,
        auth_headers: dict[str, str],
    ) -> None:
        """测试创建主评论."""
        response = await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "这是一条测试评论"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["content"] == "这是一条测试评论"
        assert data["parent_id"] is None
        assert "id" in data

    async def test_create_reply(
        self,
        client: AsyncClient,
        test_skill: Skill,
        auth_headers: dict[str, str],
    ) -> None:
        """测试创建回复."""
        # 先创建主评论
        main_response = await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "主评论"},
        )
        assert main_response.status_code == 201
        main_comment_id = main_response.json()["id"]

        # 创建回复
        reply_response = await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "这是一条回复", "parent_id": main_comment_id},
        )

        assert reply_response.status_code == 201
        data = reply_response.json()
        assert data["content"] == "这是一条回复"
        assert data["parent_id"] == main_comment_id

    async def test_get_comments_with_nested_replies(
        self,
        client: AsyncClient,
        test_skill: Skill,
        auth_headers: dict[str, str],
    ) -> None:
        """测试获取嵌套回复结构."""
        # 创建主评论
        main_response = await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "主评论"},
        )
        main_comment_id = main_response.json()["id"]

        # 创建两条回复
        await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "回复1", "parent_id": main_comment_id},
        )
        await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "回复2", "parent_id": main_comment_id},
        )

        # 获取评论
        response = await client.get(f"/api/v1/skills/{test_skill.id}/comments")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["content"] == "主评论"
        assert len(data[0]["replies"]) == 2

    async def test_create_comment_unauthorized(
        self, client: AsyncClient, test_skill: Skill
    ) -> None:
        """测试未登录创建评论失败."""
        response = await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            json={"content": "未登录评论"},
        )

        assert response.status_code == 401

    async def test_delete_own_comment(
        self,
        client: AsyncClient,
        test_skill: Skill,
        auth_headers: dict[str, str],
    ) -> None:
        """测试删除自己的评论."""
        # 创建评论
        create_response = await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "要删除的评论"},
        )
        comment_id = create_response.json()["id"]

        # 删除评论
        delete_response = await client.delete(
            f"/api/v1/comments/{comment_id}",
            headers=auth_headers,
        )

        assert delete_response.status_code == 200

        # 验证评论已软删除（不应出现在列表中）
        list_response = await client.get(
            f"/api/v1/skills/{test_skill.id}/comments"
        )
        comments = list_response.json()
        assert not any(c["id"] == comment_id for c in comments)

    async def test_delete_other_user_comment_fails(
        self,
        client: AsyncClient,
        test_skill: Skill,
        auth_headers: dict[str, str],
    ) -> None:
        """测试删除他人评论失败."""
        # 用户1 创建评论
        create_response = await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "其他用户的评论"},
        )
        comment_id = create_response.json()["id"]

        # 用户2 注册并登录
        unique_id = uuid4().hex[:8]
        await client.post(
            "/api/v1/auth/register",
            json={
                "username": f"other_{unique_id}",
                "email": f"other_{unique_id}@test.com",
                "password": "TestPass123!",
            },
        )
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": f"other_{unique_id}@test.com",
                "password": "TestPass123!",
            },
        )
        other_token = login_response.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}

        # 用户2 尝试删除用户1 的评论
        delete_response = await client.delete(
            f"/api/v1/comments/{comment_id}",
            headers=other_headers,
        )

        assert delete_response.status_code == 403

    async def test_delete_nonexistent_comment(
        self, client: AsyncClient, auth_headers: dict[str, str]
    ) -> None:
        """测试删除不存在的评论."""
        fake_id = str(uuid4())
        response = await client.delete(
            f"/api/v1/comments/{fake_id}",
            headers=auth_headers,
        )

        assert response.status_code == 404

    async def test_comment_content_validation(
        self,
        client: AsyncClient,
        test_skill: Skill,
        auth_headers: dict[str, str],
    ) -> None:
        """测试评论内容校验."""
        # 空内容
        response = await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": ""},
        )
        assert response.status_code == 422

        # 超长内容
        response = await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "a" * 2001},
        )
        assert response.status_code == 422


class TestCommentUsername:
    """测试评论包含 username 字段."""

    async def test_get_comments_includes_username(
        self,
        client: AsyncClient,
        test_skill: Skill,
        auth_headers: dict[str, str],
    ) -> None:
        """获取评论应包含 username 字段."""
        # 创建评论
        await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "测试评论"},
        )

        # 获取评论列表
        response = await client.get(f"/api/v1/skills/{test_skill.id}/comments")
        assert response.status_code == 200
        data = response.json()

        assert len(data) == 1
        assert "username" in data[0]
        assert data[0]["username"] != ""
        assert data[0]["username"] is not None

    async def test_comment_nested_replies_include_username(
        self,
        client: AsyncClient,
        test_skill: Skill,
        auth_headers: dict[str, str],
    ) -> None:
        """嵌套回复中也应包含 username."""
        # 创建主评论
        main_response = await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "主评论"},
        )
        main_id = main_response.json()["id"]

        # 创建回复
        await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "回复", "parent_id": main_id},
        )

        # 获取评论
        response = await client.get(f"/api/v1/skills/{test_skill.id}/comments")
        data = response.json()

        # 检查主评论有 username
        assert "username" in data[0]
        # 检查回复也有 username
        assert len(data[0]["replies"]) == 1
        assert "username" in data[0]["replies"][0]

    async def test_create_comment_returns_username(
        self,
        client: AsyncClient,
        test_skill: Skill,
        auth_headers: dict[str, str],
    ) -> None:
        """创建评论后返回的评论应包含 username."""
        response = await client.post(
            f"/api/v1/skills/{test_skill.id}/comments",
            headers=auth_headers,
            json={"content": "新评论"},
        )
        assert response.status_code == 201
        data = response.json()

        assert "username" in data
        assert data["username"] != ""
        assert data["username"] is not None
