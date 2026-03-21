"""Skill 模型."""

from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class SkillBase(SQLModel):
    """Skill 基础字段."""

    name: str = Field(max_length=100, index=True)
    description: str
    usage_scenario: str
    usage_method: str
    demo_images: list[dict] = Field(default_factory=list, sa_column=Column(JSON))
    file_path: str = Field(max_length=500)
    file_size: int
    file_tree: dict | None = Field(default=None, sa_column=Column(JSON))
    tags: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    is_deleted: bool = Field(default=False)
    is_pinned: bool = Field(default=False)
    download_count: int = Field(default=0)
    view_count: int = Field(default=0)
    rating_avg: Decimal = Field(default=Decimal("0.0"), max_digits=2, decimal_places=1)
    rating_count: int = Field(default=0)


class Skill(SkillBase, table=True):
    """Skill 表模型."""

    __tablename__ = "skills"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    author_id: UUID = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC).replace(tzinfo=None))
