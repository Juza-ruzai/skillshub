"""公开统计 API 集成测试."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


class TestPublicStatsAPI:
    """GET /api/v1/stats/public 测试."""

    @pytest.mark.asyncio
    async def test_returns_200_without_auth(self, client: AsyncClient) -> None:
        """无需鉴权即可访问."""
        response = await client.get("/api/v1/stats/public")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_response_contains_required_fields(self, client: AsyncClient) -> None:
        """响应包含 total_skills / total_downloads / total_users 三个字段."""
        response = await client.get("/api/v1/stats/public")
        data = response.json()
        assert "total_skills" in data
        assert "total_downloads" in data
        assert "total_users" in data

    @pytest.mark.asyncio
    async def test_all_fields_are_integers(self, client: AsyncClient) -> None:
        """三个字段均为整数类型."""
        response = await client.get("/api/v1/stats/public")
        data = response.json()
        assert isinstance(data["total_skills"], int)
        assert isinstance(data["total_downloads"], int)
        assert isinstance(data["total_users"], int)

    @pytest.mark.asyncio
    async def test_all_fields_are_non_negative(self, client: AsyncClient) -> None:
        """三个字段均为非负整数（不会因无数据而返回 None 或负数）."""
        response = await client.get("/api/v1/stats/public")
        data = response.json()
        assert data["total_skills"] >= 0
        assert data["total_downloads"] >= 0
        assert data["total_users"] >= 0

    @pytest.mark.asyncio
    async def test_counts_reflect_actual_data(
        self, client: AsyncClient, test_skill: dict
    ) -> None:
        """有数据时返回正确计数（total_skills >= 1, total_users >= 1）."""
        response = await client.get("/api/v1/stats/public")
        data = response.json()
        assert data["total_skills"] >= 1
        assert data["total_users"] >= 1

    @pytest.mark.asyncio
    async def test_total_downloads_sums_all_skills(
        self, client: AsyncClient, test_skill: dict, db_session: AsyncSession
    ) -> None:
        """total_downloads 是所有 skill 的 download_count 之和."""
        from uuid import UUID

        from sqlmodel import select

        from app.models.skill import Skill

        # 给 test_skill 设置 download_count = 5
        result = await db_session.execute(
            select(Skill).where(Skill.id == UUID(test_skill["id"]))
        )
        skill = result.scalar_one()
        skill.download_count = 5
        await db_session.commit()

        response = await client.get("/api/v1/stats/public")
        data = response.json()
        assert data["total_downloads"] == 5
