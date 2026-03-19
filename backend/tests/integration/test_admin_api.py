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


class TestAdminSkillManagement:
    """管理员 Skill 管理扩展测试."""

    @pytest.mark.asyncio
    async def test_edit_any_skill_success(
        self, client: AsyncClient, test_admin: dict, test_skill: dict
    ) -> None:
        """测试管理员编辑任意 Skill."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 编辑 Skill
        response = await client.put(
            f"/api/v1/admin/skills/{test_skill['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Updated Skill Name",
                "description": "Updated description",
                "usage_scenario": "Updated scenario",
                "usage_method": "Updated method",
                "tags": ["updated", "tag"],
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Skill Name"
        assert data["description"] == "Updated description"

    @pytest.mark.asyncio
    async def test_edit_nonexistent_skill(
        self, client: AsyncClient, test_admin: dict
    ) -> None:
        """测试编辑不存在的 Skill."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 编辑不存在的 Skill
        response = await client.put(
            "/api/v1/admin/skills/00000000-0000-0000-0000-000000000000",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Updated Skill Name",
                "description": "Updated description",
                "usage_scenario": "Updated scenario",
                "usage_method": "Updated method",
                "tags": ["updated"],
            },
        )

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_force_delete_skill_success(
        self, client: AsyncClient, test_admin: dict, test_skill: dict
    ) -> None:
        """测试管理员强制删除 Skill（物理删除）."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 强制删除 Skill
        response = await client.delete(
            f"/api/v1/admin/skills/{test_skill['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 204

        # 验证 Skill 已被物理删除
        skill_response = await client.get(f"/api/v1/skills/{test_skill['id']}")
        assert skill_response.status_code == 404

    @pytest.mark.asyncio
    async def test_list_deleted_skills(
        self, client: AsyncClient, test_admin: dict, test_skill: dict
    ) -> None:
        """测试获取软删除 Skill 列表."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 先软删除 Skill
        await client.delete(
            f"/api/v1/skills/{test_skill['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )

        # 获取软删除列表
        response = await client.get(
            "/api/v1/admin/skills/deleted",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 1
        assert any(item["id"] == test_skill["id"] for item in data["items"])

    @pytest.mark.asyncio
    async def test_restore_deleted_skill(
        self, client: AsyncClient, test_admin: dict, test_skill: dict
    ) -> None:
        """测试恢复软删除的 Skill."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 先软删除 Skill
        await client.delete(
            f"/api/v1/skills/{test_skill['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )

        # 恢复 Skill
        response = await client.post(
            f"/api/v1/admin/skills/{test_skill['id']}/restore",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_deleted"] is False

        # 验证 Skill 可以再次访问
        skill_response = await client.get(f"/api/v1/skills/{test_skill['id']}")
        assert skill_response.status_code == 200

    @pytest.mark.asyncio
    async def test_get_skill_downloads(
        self, client: AsyncClient, test_admin: dict, test_skill: dict
    ) -> None:
        """测试查看 Skill 下载用户列表."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 查看下载列表
        response = await client.get(
            f"/api/v1/admin/skills/{test_skill['id']}/downloads",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)


class TestAdminUserManagement:
    """管理员用户管理测试."""

    @pytest.mark.asyncio
    async def test_list_users(
        self, client: AsyncClient, test_admin: dict, test_user: dict
    ) -> None:
        """测试获取用户列表."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 获取用户列表
        response = await client.get(
            "/api/v1/admin/users",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 2  # 至少包含 admin 和 test_user

    @pytest.mark.asyncio
    async def test_search_users(
        self, client: AsyncClient, test_admin: dict, test_user: dict
    ) -> None:
        """测试搜索用户."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 搜索用户
        response = await client.get(
            "/api/v1/admin/users?search=testuser",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert any(user["username"] == "testuser" for user in data["items"])

    @pytest.mark.asyncio
    async def test_set_user_admin_status(
        self, client: AsyncClient, test_admin: dict, test_user: dict
    ) -> None:
        """测试设置用户管理员权限."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 设置用户为管理员
        response = await client.patch(
            f"/api/v1/admin/users/{test_user['id']}/admin",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_admin": True},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_admin"] is True

        # 取消管理员权限
        response = await client.patch(
            f"/api/v1/admin/users/{test_user['id']}/admin",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_admin": False},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_admin"] is False

    @pytest.mark.asyncio
    async def test_set_user_active_status(
        self, client: AsyncClient, test_admin: dict, test_user: dict
    ) -> None:
        """测试启用/禁用用户账号."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 禁用用户
        response = await client.patch(
            f"/api/v1/admin/users/{test_user['id']}/status",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_active": False},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False

        # 启用用户
        response = await client.patch(
            f"/api/v1/admin/users/{test_user['id']}/status",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_active": True},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is True


class TestAdminCommentManagement:
    """管理员评论管理测试."""

    @pytest.mark.asyncio
    async def test_list_comments(
        self, client: AsyncClient, test_admin: dict, test_comment: dict
    ) -> None:
        """测试获取评论列表."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 获取评论列表
        response = await client.get(
            "/api/v1/admin/comments",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 1

    @pytest.mark.asyncio
    async def test_list_comments_with_filter(
        self, client: AsyncClient, test_admin: dict, test_comment: dict, test_skill: dict
    ) -> None:
        """测试带筛选条件的评论列表."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 按 Skill ID 筛选
        response = await client.get(
            f"/api/v1/admin/comments?skill_id={test_skill['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data


class TestAdminStatistics:
    """管理员数据统计测试."""

    @pytest.mark.asyncio
    async def test_get_overview_stats(
        self, client: AsyncClient, test_admin: dict
    ) -> None:
        """测试获取平台概览统计."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 获取概览统计
        response = await client.get(
            "/api/v1/admin/stats/overview",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "total_skills" in data
        assert "total_users" in data
        assert "today_downloads" in data
        assert "today_comments" in data
        assert "today_uploads" in data

    @pytest.mark.asyncio
    async def test_get_active_users(
        self, client: AsyncClient, test_admin: dict
    ) -> None:
        """测试获取活跃用户榜单."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 获取活跃用户榜单
        response = await client.get(
            "/api/v1/admin/stats/active-users",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)

    @pytest.mark.asyncio
    async def test_export_users_csv(
        self, client: AsyncClient, test_admin: dict, test_user: dict
    ) -> None:
        """测试导出用户 CSV."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 导出用户 CSV
        response = await client.get(
            "/api/v1/admin/export/users",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        assert "attachment" in response.headers["content-disposition"]

        # 验证 CSV 内容
        content = response.text
        assert "username" in content
        assert test_user["username"] in content

    @pytest.mark.asyncio
    async def test_export_tags_csv(
        self, client: AsyncClient, test_admin: dict, test_skill: dict
    ) -> None:
        """测试导出标签统计 CSV."""
        # 管理员登录
        login_response = await client.post(
            "/api/v1/auth/login",
            data={
                "username": test_admin["email"],
                "password": test_admin["password"],
            },
        )
        token = login_response.json()["access_token"]

        # 导出标签 CSV
        response = await client.get(
            "/api/v1/admin/export/tags",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        assert "attachment" in response.headers["content-disposition"]

        # 验证 CSV 内容
        content = response.text
        assert "name" in content
