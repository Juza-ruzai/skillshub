"""Skills API 测试 - 验证 author_username 字段."""
from httpx import AsyncClient


class TestSkillListAuthorUsername:
    """测试 Skill 列表返回 author_username."""

    async def test_list_skills_includes_author_username(
        self,
        client: AsyncClient,
        test_skill: dict,
    ) -> None:
        """Skill 列表应包含非空的 author_username."""
        response = await client.get("/api/v1/skills")
        assert response.status_code == 200
        data = response.json()

        assert "items" in data
        assert len(data["items"]) > 0

        # 检查每个 skill 都有 author_username
        for skill in data["items"]:
            assert "author_username" in skill
            assert skill["author_username"] != ""
            assert skill["author_username"] is not None

    async def test_trending_skills_includes_author_username(
        self,
        client: AsyncClient,
        test_skill: dict,
    ) -> None:
        """本周热门列表应包含 author_username."""
        response = await client.get("/api/v1/skills/trending")
        assert response.status_code == 200
        data = response.json()

        if len(data) > 0:
            for skill in data:
                assert "author_username" in skill
                assert skill["author_username"] != ""

    async def test_top_rated_skills_includes_author_username(
        self,
        client: AsyncClient,
        test_skill: dict,
    ) -> None:
        """评分最高列表应包含 author_username."""
        response = await client.get("/api/v1/skills/top-rated")
        assert response.status_code == 200
        data = response.json()

        if len(data) > 0:
            for skill in data:
                assert "author_username" in skill
                assert skill["author_username"] != ""

    async def test_most_downloaded_skills_includes_author_username(
        self,
        client: AsyncClient,
        test_skill: dict,
    ) -> None:
        """下载最多列表应包含 author_username."""
        response = await client.get("/api/v1/skills/most-downloaded")
        assert response.status_code == 200
        data = response.json()

        if len(data) > 0:
            for skill in data:
                assert "author_username" in skill
                assert skill["author_username"] != ""
