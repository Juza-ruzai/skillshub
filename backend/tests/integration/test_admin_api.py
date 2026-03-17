"""管理后台 API 集成测试."""

import pytest
from httpx import AsyncClient


class TestAdminAuth:
    """管理员权限测试."""

    @pytest.mark.asyncio
    async def test_admin_endpoint_requires_auth(self, client: AsyncClient) -> None:
        """测试管理端点需要认证."""
        response = await client.post("/api/v1/admin/skills/123/pin")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_admin_endpoint_requires_admin_role(
        self, client: AsyncClient, test_user: dict
    ) -> None:
        """测试管理端点需要管理员权限."""
        # 普通用户登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_user["email"],
                "password": test_user["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 尝试访问管理端点
        response = await client.post(
            "/api/v1/admin/skills/123/pin",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "管理员" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_admin_can_access_admin_endpoint(
        self, client: AsyncClient, test_admin: dict
    ) -> None:
        """测试管理员可以访问管理端点."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 尝试访问管理端点（即使 skill 不存在，也应该返回 404 而不是 403）
        response = await client.post(
            "/api/v1/admin/skills/00000000-0000-0000-0000-000000000000/pin",
            headers={"Authorization": f"Bearer {token}"},
        )

        # 应该是 404（Skill 不存在），而不是 403（权限不足）
        assert response.status_code == 404


class TestAdminPinSkill:
    """置顶 Skill 测试."""

    @pytest.mark.asyncio
    async def test_pin_skill_success(
        self, client: AsyncClient, test_admin: dict, test_skill: dict
    ) -> None:
        """测试管理员成功置顶 Skill."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 置顶 Skill
        response = await client.post(
            f"/api/v1/admin/skills/{test_skill['id']}/pin",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_pinned"] is True

    @pytest.mark.asyncio
    async def test_unpin_skill_success(
        self, client: AsyncClient, test_admin: dict, test_skill: dict
    ) -> None:
        """测试管理员成功取消置顶 Skill."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 先调用一次确保置顶状态
        first_response = await client.post(
            f"/api/v1/admin/skills/{test_skill['id']}/pin",
            headers={"Authorization": f"Bearer {token}"},
        )
        first_state = first_response.json()["is_pinned"]

        # 再次调用切换状态
        response = await client.post(
            f"/api/v1/admin/skills/{test_skill['id']}/pin",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        # 验证状态被切换（与之前相反）
        assert data["is_pinned"] is not first_state

    @pytest.mark.asyncio
    async def test_pin_nonexistent_skill(
        self, client: AsyncClient, test_admin: dict
    ) -> None:
        """测试置顶不存在的 Skill."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 置顶不存在的 Skill
        response = await client.post(
            "/api/v1/admin/skills/00000000-0000-0000-0000-000000000000/pin",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404


class TestAdminDeleteComment:
    """管理员删除评论测试."""

    @pytest.mark.asyncio
    async def test_delete_any_comment_success(
        self, client: AsyncClient, test_admin: dict, test_comment: dict
    ) -> None:
        """测试管理员删除任意评论."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 管理员删除评论
        response = await client.delete(
            f"/api/v1/admin/comments/{test_comment['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_delete_nonexistent_comment(
        self, client: AsyncClient, test_admin: dict
    ) -> None:
        """测试删除不存在的评论."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 删除不存在的评论
        response = await client.delete(
            "/api/v1/admin/comments/00000000-0000-0000-0000-000000000000",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 404


class TestAdminExportSkills:
    """导出 Skills CSV 测试."""

    @pytest.mark.asyncio
    async def test_export_skills_csv(
        self, client: AsyncClient, test_admin: dict, test_skill: dict
    ) -> None:
        """测试导出 Skills CSV."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 导出 CSV
        response = await client.get(
            "/api/v1/admin/export",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        assert "attachment" in response.headers["content-disposition"]

        # 验证 CSV 内容
        content = response.text
        assert "name" in content  # 表头
        assert test_skill["name"] in content

    @pytest.mark.asyncio
    async def test_export_skills_empty(
        self, client: AsyncClient, test_admin: dict
    ) -> None:
        """测试导出空 Skills CSV."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 导出 CSV
        response = await client.get(
            "/api/v1/admin/export",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        # 即使没有数据也应该返回 CSV 表头
        content = response.text
        assert "name" in content


class TestAdminTags:
    """标签管理测试."""

    @pytest.mark.asyncio
    async def test_list_tags(
        self, client: AsyncClient, test_admin: dict, test_skill: dict
    ) -> None:
        """测试获取标签列表."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 获取标签列表
        response = await client.get(
            "/api/v1/admin/tags",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)

    @pytest.mark.asyncio
    async def test_merge_tags(
        self, client: AsyncClient, test_admin: dict
    ) -> None:
        """测试合并标签."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 合并标签
        response = await client.post(
            "/api/v1/admin/tags/merge",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "source_tags": ["ai", "AI"],
                "target_tag": "artificial-intelligence",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["merged_count"] >= 0
