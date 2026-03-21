"""通用 Schema 定义."""

from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, computed_field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应基础模型."""

    model_config = ConfigDict(from_attributes=True)

    items: list[T]
    total: int
    page: int
    page_size: int

    @computed_field  # type: ignore[prop-decorator]
    @property
    def pages(self) -> int:
        """计算总页数."""
        if self.page_size <= 0:
            return 0
        return (self.total + self.page_size - 1) // self.page_size
