"""标签 API 路由（公开访问）."""

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.models.tag import Tag

router = APIRouter()


@router.get("/")
async def list_tags(
    db_session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """获取所有标签列表（公开访问）.

    Args:
        db_session: 数据库会话

    Returns:
        标签列表，按使用次数降序排列
    """
    result = await db_session.execute(select(Tag).order_by(desc(Tag.usage_count)))
    tags = result.scalars().all()

    return {
        "items": [
            {
                "name": tag.name,
                "usage_count": tag.usage_count or 0,
            }
            for tag in tags
        ],
    }
