"""认证 API 集成测试."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


class TestAuthAPI:
    """认证 API 测试."""

    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient) -> None:
        """测试成功注册."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "username": "newuser",
                "email": "new@example.com",
                "password": "SecurePass123",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "new@example.com"
        assert "id" in data
        assert "password" not in data
        assert "password_hash" not in data

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, client: AsyncClient) -> None:
        """测试注册时邮箱已存在."""
        # 先注册一个用户
        await client.post(
            "/api/v1/auth/register",
            json={
                "username": "firstuser",
                "email": "duplicate@example.com",
                "password": "SecurePass123",
            },
        )

        # 再尝试用相同邮箱注册
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "username": "anotheruser",
                "email": "duplicate@example.com",
                "password": "SecurePass123",
            },
        )

        assert response.status_code == 409
        assert "邮箱已被注册" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_register_duplicate_username(self, client: AsyncClient) -> None:
        """测试注册时用户名已存在."""
        # 先注册一个用户
        await client.post(
            "/api/v1/auth/register",
            json={
                "username": "uniqueuser",
                "email": "first@example.com",
                "password": "SecurePass123",
            },
        )

        # 再尝试用相同用户名注册
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "username": "uniqueuser",
                "email": "second@example.com",
                "password": "SecurePass123",
            },
        )

        assert response.status_code == 409
        assert "用户名已被使用" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client: AsyncClient) -> None:
        """测试注册时邮箱格式无效."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "username": "newuser",
                "email": "invalid-email",
                "password": "SecurePass123",
            },
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_short_password(self, client: AsyncClient) -> None:
        """测试注册时密码太短."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "username": "newuser",
                "email": "new@example.com",
                "password": "12345",  # 太短
            },
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient) -> None:
        """测试成功登录."""
        # 先注册用户
        await client.post(
            "/api/v1/auth/register",
            json={
                "username": "logintest",
                "email": "login@example.com",
                "password": "TestPass123",
            },
        )

        # 登录
        response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "login@example.com",
                "password": "TestPass123",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        # 检查是否有 refresh token cookie
        assert "set-cookie" in response.headers

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient) -> None:
        """测试登录时密码错误."""
        # 先注册用户
        await client.post(
            "/api/v1/auth/register",
            json={
                "username": "wrongpasstest",
                "email": "wrongpass@example.com",
                "password": "CorrectPass123",
            },
        )

        response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "wrongpass@example.com",
                "password": "wrongpassword",
            },
        )

        assert response.status_code == 401
        assert "邮箱或密码错误" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_login_user_not_found(self, client: AsyncClient) -> None:
        """测试登录时用户不存在."""
        response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "nonexistent@example.com",
                "password": "somepassword",
            },
        )

        assert response.status_code == 401
        assert "邮箱或密码错误" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_current_user_success(self, client: AsyncClient) -> None:
        """测试获取当前用户信息."""
        # 先注册用户
        await client.post(
            "/api/v1/auth/register",
            json={
                "username": "metest",
                "email": "me@example.com",
                "password": "MePass123",
            },
        )

        # 登录获取 token
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "me@example.com",
                "password": "MePass123",
            },
        )
        token = login_response.json()["access_token"]

        # 使用 token 访问受保护接口
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "me@example.com"
        assert data["username"] == "metest"

    @pytest.mark.asyncio
    async def test_get_current_user_no_token(self, client: AsyncClient) -> None:
        """测试未提供 token 访问受保护接口."""
        response = await client.get("/api/v1/auth/me")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self, client: AsyncClient) -> None:
        """测试使用无效 token 访问受保护接口."""
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"},
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_refresh_token_success(self, client: AsyncClient) -> None:
        """测试刷新 token."""
        # 先注册用户
        await client.post(
            "/api/v1/auth/register",
            json={
                "username": "refreshtest",
                "email": "refresh@example.com",
                "password": "Refresh123",
            },
        )

        # 先登录获取 refresh token (cookie)
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "refresh@example.com",
                "password": "Refresh123",
            },
        )

        # 从 cookie 中获取 refresh token
        cookies = login_response.cookies

        # 使用 refresh token 获取新的 access token
        response = await client.post(
            "/api/v1/auth/refresh",
            cookies=cookies,
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_refresh_token_no_cookie(self, client: AsyncClient) -> None:
        """测试没有 refresh cookie 时刷新 token."""
        response = await client.post("/api/v1/auth/refresh")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_logout_success(self, client: AsyncClient) -> None:
        """测试登出."""
        # 先注册用户
        await client.post(
            "/api/v1/auth/register",
            json={
                "username": "logouttest",
                "email": "logout@example.com",
                "password": "Logout123",
            },
        )

        # 先登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": "logout@example.com",
                "password": "Logout123",
            },
        )
        token = login_response.json()["access_token"]

        # 登出
        response = await client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        # 检查是否清除了 cookie
        assert "set-cookie" in response.headers

    @pytest.mark.asyncio
    async def test_get_current_user_disabled_returns_403(
        self, client: AsyncClient, test_user: dict, db_session: AsyncSession
    ) -> None:
        """测试被禁用用户访问受保护端点返回 403."""
        # 先登录获取 token
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user["email"],
                "password": test_user["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 直接禁用用户（通过数据库会话）
        from uuid import UUID

        from sqlalchemy import select

        from app.models.user import User

        result = await db_session.execute(select(User).where(User.id == UUID(test_user["id"])))
        user = result.scalar_one()
        user.is_active = False
        await db_session.commit()

        # 尝试使用 token 访问受保护端点
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "账号已被禁用" in response.json()["detail"]

        # 清理：重新启用用户，避免影响其他测试
        result = await db_session.execute(select(User).where(User.id == UUID(test_user["id"])))
        user = result.scalar_one()
        user.is_active = True
        await db_session.commit()
