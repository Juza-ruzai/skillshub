"""Skill 相关 Pydantic Schema."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class SkillCreate(BaseModel):
    """创建 Skill 请求 Schema."""

    name: str = Field(..., min_length=1, max_length=100, description="Skill 名称")
    description: str = Field(..., min_length=10, description="简介描述")
    usage_scenario: str = Field(..., min_length=5, description="使用场景")
    usage_method: str = Field(..., min_length=5, description="使用方法")
    tags: list[str] = Field(default_factory=list, description="标签列表")

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, v: list[str]) -> list[str]:
        """规范化标签：转小写、去重、去空."""
        if not v:
            return []
        # 转小写、去空、去重
        normalized = []
        seen = set()
        for tag in v:
            tag_lower = tag.lower().strip()
            if tag_lower and tag_lower not in seen:
                normalized.append(tag_lower)
                seen.add(tag_lower)
        return normalized


class SkillUpdate(BaseModel):
    """更新 Skill 请求 Schema."""

    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, min_length=10)
    usage_scenario: str | None = Field(None, min_length=5)
    usage_method: str | None = Field(None, min_length=5)
    tags: list[str] | None = Field(None)

    @model_validator(mode="after")
    def check_at_least_one_field(self) -> "SkillUpdate":
        """确保至少更新一个字段."""
        fields = ["name", "description", "usage_scenario", "usage_method", "tags"]
        if not any(getattr(self, f) is not None for f in fields):
            raise ValueError("At least one field must be provided for update")
        return self

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, v: list[str] | None) -> list[str] | None:
        """规范化标签."""
        if v is None:
            return None
        normalized = []
        seen = set()
        for tag in v:
            tag_lower = tag.lower().strip()
            if tag_lower and tag_lower not in seen:
                normalized.append(tag_lower)
                seen.add(tag_lower)
        return normalized


class SkillResponse(BaseModel):
    """Skill 响应基础 Schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str
    usage_scenario: str
    usage_method: str
    demo_images: list[dict] = []
    cover_url: str | None = None
    file_path: str
    file_size: int
    file_tree: list | None = None
    tags: list[str] = []
    author_id: UUID
    is_deleted: bool = False
    is_pinned: bool = False
    download_count: int = 0
    view_count: int = 0
    rating_avg: float = 0.0
    rating_count: int = 0
    created_at: datetime
    updated_at: datetime


class SkillListResponse(BaseModel):
    """Skill 列表项响应 Schema."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str
    cover_url: str | None = None
    tags: list[str] = []
    author_id: UUID
    author_username: str
    download_count: int = 0
    favorite_count: int = 0
    rating_avg: float = 0.0
    rating_count: int = 0
    is_pinned: bool = False
    created_at: datetime


class SkillDetailResponse(BaseModel):
    """Skill 详情响应 Schema（包含当前用户相关信息）."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str
    usage_scenario: str
    usage_method: str
    demo_images: list[dict] = []
    cover_url: str | None = None
    file_path: str
    file_size: int
    file_tree: list | None = None
    tags: list[str] = []
    author_id: UUID
    author_username: str
    is_favorite: bool = False
    user_rating: int | None = None
    download_count: int = 0
    view_count: int = 0
    favorite_count: int = 0
    rating_avg: float = 0.0
    rating_count: int = 0
    created_at: datetime
    updated_at: datetime


class SkillFilterParams(BaseModel):
    """Skill 列表筛选参数."""

    page: int = Field(1, ge=1, description="页码")
    page_size: int = Field(20, ge=1, description="每页数量")
    sort_by: str = Field("hot_score", pattern="^(hot_score|created_at|rating|download_count)$")
    search: str | None = Field(None, description="搜索关键词")
    tag: str | None = Field(None, description="标签筛选")

    @field_validator("page_size")
    @classmethod
    def limit_page_size(cls, v: int) -> int:
        """限制 page_size 最大为 100."""
        return min(v, 100)


class RatingCreate(BaseModel):
    """创建评分请求 Schema."""

    score: int = Field(..., ge=1, le=5, description="评分 1-5")


class RatingResponse(BaseModel):
    """评分响应 Schema."""

    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    skill_id: UUID
    score: int
    created_at: datetime
    updated_at: datetime


class FavoriteResponse(BaseModel):
    """收藏响应 Schema."""

    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    skill_id: UUID
    is_favorited: bool = True
    created_at: datetime | None = None
