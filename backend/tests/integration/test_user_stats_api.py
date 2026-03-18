"""用户统计 API 测试."""
import pytest
from httpx import AsyncClient


@pytest.fixture
async def auth_headers(client: AsyncClient, test_user: dict) -> dict:
    """创建认证头."""
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": test_user["email"], "password": test_user["password"]},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestGetUserStats:
    """测试获取用户统计信息."""

    async def test_get_user_stats_unauthorized(self, client: AsyncClient) -> None:
        """未登录返回 401."""
        response = await client.get("/api/v1/users/me/stats")
        assert response.status_code == 401

    async def test_get_user_stats_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_skill: dict,
    ) -> None:
        """登录用户获取统计信息成功."""
        response = await client.get(
            "/api/v1/users/me/stats",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()

        # 验证返回字段
        assert "total_skills" in data
        assert "total_pv" in data
        assert "total_downloads" in data
        assert "total_favorites" in data
        assert "rating_distribution" in data
        assert "trend_7d" in data
        assert "trend_30d" in data

        # 验证数据类型
        assert isinstance(data["total_skills"], int)
        assert isinstance(data["total_pv"], int)
        assert isinstance(data["total_downloads"], int)
        assert isinstance(data["total_favorites"], int)
        assert isinstance(data["rating_distribution"], dict)
        assert isinstance(data["trend_7d"], list)
        assert isinstance(data["trend_30d"], list)

    async def test_get_user_stats_rating_distribution(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ) -> None:
        """评分分布包含 1-5 星."""
        response = await client.get(
            "/api/v1/users/me/stats",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()

        dist = data["rating_distribution"]
        assert "1" in dist
        assert "2" in dist
        assert "3" in dist
        assert "4" in dist
        assert "5" in dist

    async def test_get_user_stats_trend_7d_format(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ) -> None:
        """7天趋势数据格式正确."""
        response = await client.get(
            "/api/v1/users/me/stats",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()

        trend = data["trend_7d"]
        assert len(trend) == 7
        for day in trend:
            assert "date" in day
            assert "pv" in day
            assert "downloads" in day

    async def test_get_user_stats_trend_30d_format(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ) -> None:
        """30天趋势数据格式正确."""
        response = await client.get(
            "/api/v1/users/me/stats",
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()

        trend = data["trend_30d"]
        assert len(trend) == 30
        for day in trend:
            assert "date" in day
            assert "pv" in day
            assert "downloads" in day
