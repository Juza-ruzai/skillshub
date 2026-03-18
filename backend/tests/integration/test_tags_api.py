"""标签 API 测试 - 公开访问."""
from httpx import AsyncClient


class TestPublicTagsAPI:
    """测试公开标签列表接口."""

    async def test_list_tags_public_access(
        self,
        client: AsyncClient,
    ) -> None:
        """无需登录可访问标签列表."""
        response = await client.get("/api/v1/tags")
        assert response.status_code == 200
        data = response.json()

        assert "items" in data
        assert isinstance(data["items"], list)

    async def test_list_tags_sorted_by_usage(
        self,
        client: AsyncClient,
    ) -> None:
        """标签按使用次数降序排列."""
        response = await client.get("/api/v1/tags")
        assert response.status_code == 200
        data = response.json()

        items = data["items"]
        if len(items) > 1:
            # 检查是否按 usage_count 降序
            for i in range(len(items) - 1):
                assert items[i]["usage_count"] >= items[i + 1]["usage_count"]

    async def test_list_tags_returns_name_and_count(
        self,
        client: AsyncClient,
    ) -> None:
        """返回 name 和 usage_count 字段."""
        response = await client.get("/api/v1/tags")
        assert response.status_code == 200
        data = response.json()

        for tag in data["items"]:
            assert "name" in tag
            assert "usage_count" in tag
            assert isinstance(tag["name"], str)
            assert isinstance(tag["usage_count"], int)
