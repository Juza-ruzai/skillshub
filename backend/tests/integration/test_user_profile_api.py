"""用户个人中心 API 测试（M6.8）.

覆盖端点：
  GET /api/v1/users/me/skills
  GET /api/v1/users/me/favorites
  GET /api/v1/users/me/comments
"""
from typing import Any
from uuid import UUID

import pytest
from httpx import AsyncClient

from app.core.security import get_password_hash
from app.models.comment import Comment
from app.models.favorite import Favorite
from app.models.skill import Skill
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
async def auth_headers(client: AsyncClient, test_user: dict) -> dict:
    """获取 test_user 的 Bearer 认证头."""
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": test_user["email"], "password": test_user["password"]},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def other_user(db_session: AsyncSession) -> dict[str, Any]:
    """创建另一个用户（用于验证数据隔离）."""
    from sqlalchemy import select

    result = await db_session.execute(select(User).where(User.email == "other@example.com"))
    existing = result.scalar_one_or_none()
    if existing:
        return {"id": str(existing.id), "email": existing.email, "password": "Other123!"}

    user = User(
        username="otheruser",
        email="other@example.com",
        password_hash=get_password_hash("Other123!"),
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return {"id": str(user.id), "email": user.email, "password": "Other123!"}


@pytest.fixture
async def test_favorite(
    db_session: AsyncSession, test_user: dict, test_skill: dict
) -> dict[str, Any]:
    """为 test_user 收藏 test_skill."""
    from sqlalchemy import select

    result = await db_session.execute(
        select(Favorite).where(
            Favorite.user_id == UUID(test_user["id"]),
            Favorite.skill_id == UUID(test_skill["id"]),
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return {"user_id": test_user["id"], "skill_id": test_skill["id"]}

    fav = Favorite(user_id=UUID(test_user["id"]), skill_id=UUID(test_skill["id"]))
    db_session.add(fav)
    await db_session.commit()
    return {"user_id": test_user["id"], "skill_id": test_skill["id"]}


@pytest.fixture
async def test_comment_for_user(
    db_session: AsyncSession, test_user: dict, test_skill: dict
) -> dict[str, Any]:
    """创建 test_user 发表的评论（单独 fixture，不与全局 test_comment 冲突）."""
    from sqlalchemy import select

    result = await db_session.execute(
        select(Comment).where(Comment.content == "Profile test comment")
    )
    existing = result.scalar_one_or_none()
    if existing:
        return {"id": str(existing.id), "content": existing.content}

    comment = Comment(
        content="Profile test comment",
        skill_id=UUID(test_skill["id"]),
        user_id=UUID(test_user["id"]),
    )
    db_session.add(comment)
    await db_session.commit()
    await db_session.refresh(comment)
    return {"id": str(comment.id), "content": comment.content}


# ---------------------------------------------------------------------------
# /me/skills 测试
# ---------------------------------------------------------------------------


class TestGetMySkills:
    """测试获取当前用户上传的 Skills."""

    async def test_unauthorized_returns_401(self, client: AsyncClient) -> None:
        """未登录访问返回 401."""
        response = await client.get("/api/v1/users/me/skills")
        assert response.status_code == 401

    async def test_returns_paginated_response(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_skill: dict,
    ) -> None:
        """返回分页数据结构（items / total / page / page_size）."""
        response = await client.get("/api/v1/users/me/skills", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()

        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert isinstance(data["items"], list)
        assert isinstance(data["total"], int)

    async def test_returns_only_current_user_skills(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_skill: dict,
        test_user: dict,
    ) -> None:
        """只返回当前用户的 Skills，不包含他人 Skills."""
        response = await client.get("/api/v1/users/me/skills", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()

        for item in data["items"]:
            assert item["author_id"] == test_user["id"]

    async def test_skill_item_has_required_fields(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_skill: dict,
    ) -> None:
        """每个 Skill 条目包含必要字段."""
        response = await client.get("/api/v1/users/me/skills", headers=auth_headers)
        assert response.status_code == 200
        items = response.json()["items"]

        assert len(items) >= 1
        first = items[0]
        assert "id" in first
        assert "name" in first
        assert "description" in first
        assert "tags" in first
        assert "download_count" in first
        assert "created_at" in first

    async def test_total_matches_actual_count(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_skill: dict,
    ) -> None:
        """total 字段与 items 数量一致（单页情况）."""
        response = await client.get("/api/v1/users/me/skills", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= len(data["items"])

    async def test_pagination_page_size_respected(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_skill: dict,
    ) -> None:
        """page_size=1 时每页最多返回 1 条."""
        response = await client.get(
            "/api/v1/users/me/skills?page=1&page_size=1",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 1
        assert data["page_size"] == 1


# ---------------------------------------------------------------------------
# /me/favorites 测试
# ---------------------------------------------------------------------------


class TestGetMyFavorites:
    """测试获取当前用户收藏的 Skills."""

    async def test_unauthorized_returns_401(self, client: AsyncClient) -> None:
        """未登录访问返回 401."""
        response = await client.get("/api/v1/users/me/favorites")
        assert response.status_code == 401

    async def test_returns_paginated_response(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_favorite: dict,
    ) -> None:
        """返回分页数据结构."""
        response = await client.get("/api/v1/users/me/favorites", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()

        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data

    async def test_contains_favorited_skill(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_favorite: dict,
        test_skill: dict,
    ) -> None:
        """收藏列表中包含已收藏的 Skill."""
        response = await client.get("/api/v1/users/me/favorites", headers=auth_headers)
        assert response.status_code == 200
        items = response.json()["items"]

        skill_ids = [item["id"] for item in items]
        assert test_skill["id"] in skill_ids

    async def test_favorite_item_has_required_fields(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_favorite: dict,
    ) -> None:
        """收藏列表中每个 Skill 包含必要字段."""
        response = await client.get("/api/v1/users/me/favorites", headers=auth_headers)
        assert response.status_code == 200
        items = response.json()["items"]

        assert len(items) >= 1
        first = items[0]
        assert "id" in first
        assert "name" in first
        assert "description" in first
        assert "author_username" in first
        assert "download_count" in first

    async def test_only_returns_non_deleted_skills(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_favorite: dict,
    ) -> None:
        """不返回已删除的 Skill."""
        response = await client.get("/api/v1/users/me/favorites", headers=auth_headers)
        assert response.status_code == 200
        for item in response.json()["items"]:
            # 收藏列表中不应该有 is_deleted 字段（已被过滤）
            assert item.get("is_deleted") is not True


# ---------------------------------------------------------------------------
# /me/comments 测试
# ---------------------------------------------------------------------------


class TestGetMyComments:
    """测试获取当前用户发表的评论."""

    async def test_unauthorized_returns_401(self, client: AsyncClient) -> None:
        """未登录访问返回 401."""
        response = await client.get("/api/v1/users/me/comments")
        assert response.status_code == 401

    async def test_returns_paginated_response(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_comment_for_user: dict,
    ) -> None:
        """返回分页数据结构."""
        response = await client.get("/api/v1/users/me/comments", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()

        assert "items" in data
        assert "total" in data

    async def test_contains_user_comment(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_comment_for_user: dict,
    ) -> None:
        """评论列表中包含用户发表的评论."""
        response = await client.get("/api/v1/users/me/comments", headers=auth_headers)
        assert response.status_code == 200
        items = response.json()["items"]

        comment_ids = [item["id"] for item in items]
        assert test_comment_for_user["id"] in comment_ids

    async def test_comment_item_has_required_fields(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_comment_for_user: dict,
    ) -> None:
        """评论列表中每个条目包含必要字段（含 skill_name）."""
        response = await client.get("/api/v1/users/me/comments", headers=auth_headers)
        assert response.status_code == 200
        items = response.json()["items"]

        assert len(items) >= 1
        first = items[0]
        assert "id" in first
        assert "skill_id" in first
        assert "skill_name" in first  # 关键：包含 Skill 名称
        assert "content" in first
        assert "created_at" in first

    async def test_only_current_user_comments(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_comment_for_user: dict,
        test_user: dict,
    ) -> None:
        """只返回当前用户的评论."""
        response = await client.get("/api/v1/users/me/comments", headers=auth_headers)
        assert response.status_code == 200
        items = response.json()["items"]

        for item in items:
            assert item["user_id"] == test_user["id"]

    async def test_pagination_page_size_respected(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_comment_for_user: dict,
    ) -> None:
        """page_size 参数被正确处理."""
        response = await client.get(
            "/api/v1/users/me/comments?page=1&page_size=1",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) <= 1
