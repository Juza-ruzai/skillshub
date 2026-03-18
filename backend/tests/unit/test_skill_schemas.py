"""Skill 相关 Schema 单元测试."""
from decimal import Decimal
from uuid import uuid4

import pytest
from pydantic import ValidationError


class TestSkillCreateSchema:
    """SkillCreate Schema 测试."""

    def test_valid_skill_create(self) -> None:
        """测试有效的 Skill 创建数据."""
        from app.schemas.skill import SkillCreate

        data = {
            "name": "PDF Parser",
            "description": "Parse PDF documents",
            "usage_scenario": "Document processing",
            "usage_method": "Upload PDF and run",
            "tags": ["pdf", "parser"],
        }
        schema = SkillCreate(**data)

        assert schema.name == "PDF Parser"
        assert schema.description == "Parse PDF documents"
        assert schema.tags == ["pdf", "parser"]

    def test_name_too_long(self) -> None:
        """测试名称过长验证失败."""
        from app.schemas.skill import SkillCreate

        with pytest.raises(ValidationError) as exc_info:
            SkillCreate(
                name="A" * 101,
                description="Valid description",
                usage_scenario="Usage",
                usage_method="Method",
            )
        assert "name" in str(exc_info.value)

    def test_name_empty(self) -> None:
        """测试名称为空验证失败."""
        from app.schemas.skill import SkillCreate

        with pytest.raises(ValidationError) as exc_info:
            SkillCreate(
                name="",
                description="Valid description",
                usage_scenario="Usage",
                usage_method="Method",
            )
        assert "name" in str(exc_info.value)

    def test_description_too_short(self) -> None:
        """测试描述过短验证失败."""
        from app.schemas.skill import SkillCreate

        with pytest.raises(ValidationError) as exc_info:
            SkillCreate(
                name="Valid Name",
                description="AB",  # Too short
                usage_scenario="Usage",
                usage_method="Method",
            )
        assert "description" in str(exc_info.value)

    def test_optional_fields_defaults(self) -> None:
        """测试可选字段默认值."""
        from app.schemas.skill import SkillCreate

        schema = SkillCreate(
            name="Minimal Skill",
            description="A valid description",
            usage_scenario="Usage",
            usage_method="Method",
        )

        assert schema.tags == []

    def test_tags_normalization(self) -> None:
        """测试标签规范化（转小写、去重）."""
        from app.schemas.skill import SkillCreate

        schema = SkillCreate(
            name="Test",
            description="Description",
            usage_scenario="Usage",
            usage_method="Method",
            tags=["Python", "PYTHON", "python", "PDF", "pdf"],
        )

        assert schema.tags == ["python", "pdf"]


class TestSkillUpdateSchema:
    """SkillUpdate Schema 测试."""

    def test_valid_skill_update(self) -> None:
        """测试有效的 Skill 更新数据."""
        from app.schemas.skill import SkillUpdate

        data = {
            "name": "Updated Name",
            "description": "Updated description",
        }
        schema = SkillUpdate(**data)

        assert schema.name == "Updated Name"
        assert schema.description == "Updated description"

    def test_partial_update(self) -> None:
        """测试部分字段更新."""
        from app.schemas.skill import SkillUpdate

        schema = SkillUpdate(name="New Name Only")

        assert schema.name == "New Name Only"
        assert schema.description is None
        assert schema.tags is None

    def test_empty_update_not_allowed(self) -> None:
        """测试至少需要一个字段."""
        from app.schemas.skill import SkillUpdate

        with pytest.raises(ValidationError) as exc_info:
            SkillUpdate()

        assert "at least one field" in str(exc_info.value).lower()


class TestSkillResponseSchema:
    """SkillResponse Schema 测试."""

    def test_valid_skill_response(self) -> None:
        """测试有效的 Skill 响应数据."""
        from app.schemas.skill import SkillResponse

        skill_id = uuid4()
        author_id = uuid4()
        now = "2026-03-17T10:00:00Z"

        data = {
            "id": skill_id,
            "name": "PDF Parser",
            "description": "Parse PDF documents",
            "usage_scenario": "Document processing",
            "usage_method": "Upload PDF and run",
            "demo_images": [{"url": "demo.png", "caption": "Demo"}],
            "file_path": "uploads/test.zip",
            "file_size": 1024,
            "file_tree": {"name": "root", "type": "folder"},
            "tags": ["pdf"],
            "author_id": author_id,
            "is_deleted": False,
            "is_pinned": False,
            "download_count": 10,
            "view_count": 100,
            "rating_avg": Decimal("4.5"),
            "rating_count": 5,
            "created_at": now,
            "updated_at": now,
        }
        schema = SkillResponse(**data)

        assert schema.id == skill_id
        assert schema.name == "PDF Parser"
        assert schema.rating_avg == Decimal("4.5")
        assert schema.author_id == author_id


class TestSkillListResponseSchema:
    """SkillListResponse Schema 测试."""

    def test_list_response_with_author(self) -> None:
        """测试列表响应包含作者信息."""
        from app.schemas.skill import SkillListResponse

        skill_id = uuid4()
        author_id = uuid4()

        data = {
            "id": skill_id,
            "name": "PDF Parser",
            "description": "Parse PDF",
            "tags": ["pdf"],
            "author_id": author_id,
            "author_username": "johndoe",
            "download_count": 10,
            "rating_avg": Decimal("4.5"),
            "rating_count": 5,
            "created_at": "2026-03-17T10:00:00Z",
        }
        schema = SkillListResponse(**data)

        assert schema.author_username == "johndoe"
        assert schema.rating_avg == Decimal("4.5")


class TestSkillDetailResponseSchema:
    """SkillDetailResponse Schema 测试."""

    def test_detail_response_with_is_favorite(self) -> None:
        """测试详情响应包含当前用户是否收藏."""
        from app.schemas.skill import SkillDetailResponse

        skill_id = uuid4()
        author_id = uuid4()

        data = {
            "id": skill_id,
            "name": "PDF Parser",
            "description": "Parse PDF",
            "usage_scenario": "Usage",
            "usage_method": "Method",
            "file_path": "uploads/test.zip",
            "file_size": 1024,
            "tags": ["pdf"],
            "author_id": author_id,
            "author_username": "johndoe",
            "is_favorite": True,
            "user_rating": 5,
            "download_count": 10,
            "rating_avg": Decimal("4.5"),
            "rating_count": 5,
            "created_at": "2026-03-17T10:00:00Z",
            "updated_at": "2026-03-17T10:00:00Z",
        }
        schema = SkillDetailResponse(**data)

        assert schema.is_favorite is True
        assert schema.user_rating == 5


class TestSkillFilterParams:
    """SkillFilterParams Schema 测试."""

    def test_default_filter_params(self) -> None:
        """测试默认筛选参数."""
        from app.schemas.skill import SkillFilterParams

        params = SkillFilterParams()

        assert params.page == 1
        assert params.page_size == 20
        assert params.sort_by == "hot_score"
        assert params.search is None
        assert params.tag is None

    def test_custom_filter_params(self) -> None:
        """测试自定义筛选参数."""
        from app.schemas.skill import SkillFilterParams

        params = SkillFilterParams(
            page=2,
            page_size=50,
            sort_by="rating",
            search="pdf",
            tag="python",
        )

        assert params.page == 2
        assert params.page_size == 50
        assert params.sort_by == "rating"
        assert params.search == "pdf"
        assert params.tag == "python"

    def test_invalid_page_size(self) -> None:
        """测试无效的分页大小."""
        from app.schemas.skill import SkillFilterParams

        # 超过最大值应该被限制
        params = SkillFilterParams(page_size=200)
        assert params.page_size == 100  # Max 100

    def test_invalid_sort_by(self) -> None:
        """测试无效的排序字段."""
        from app.schemas.skill import SkillFilterParams

        with pytest.raises(ValidationError) as exc_info:
            SkillFilterParams(sort_by="invalid_field")

        assert "sort_by" in str(exc_info.value)


class TestRatingSchemas:
    """评分相关 Schema 测试."""

    def test_valid_rating_create(self) -> None:
        """测试有效的评分创建."""
        from app.schemas.skill import RatingCreate

        schema = RatingCreate(score=5)
        assert schema.score == 5

    def test_rating_score_out_of_range(self) -> None:
        """测试评分超出范围."""
        from app.schemas.skill import RatingCreate

        with pytest.raises(ValidationError) as exc_info:
            RatingCreate(score=6)
        assert "score" in str(exc_info.value)

        with pytest.raises(ValidationError) as exc_info:
            RatingCreate(score=0)
        assert "score" in str(exc_info.value)


class TestPaginatedResponseSchema:
    """分页响应 Schema 测试."""

    def test_paginated_response(self) -> None:
        """测试分页响应结构."""
        from app.schemas.common import PaginatedResponse

        response = PaginatedResponse[
            dict
        ](  # type: ignore
            items=[{"id": 1}, {"id": 2}],
            total=100,
            page=2,
            page_size=20,
            pages=5,
        )

        assert len(response.items) == 2
        assert response.total == 100
        assert response.page == 2
        assert response.pages == 5

    def test_paginated_response_calculated_pages(self) -> None:
        """测试分页响应自动计算页数."""
        from app.schemas.common import PaginatedResponse

        response = PaginatedResponse[dict](  # type: ignore
            items=[{"id": 1}],
            total=25,
            page=1,
            page_size=10,
        )

        assert response.pages == 3  # ceil(25/10) = 3
