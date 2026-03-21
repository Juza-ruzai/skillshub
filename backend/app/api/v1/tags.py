"""标签 API 路由（公开访问）."""

from collections import Counter
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.models.skill import Skill

router = APIRouter()


@router.get("/")
async def list_tags(
    db_session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """获取所有标签列表（公开访问）.

    从活跃 Skills 的 tags JSON 列聚合标签及其使用次数。

    Args:
        db_session: 数据库会话

    Returns:
        标签列表，按使用次数降序排列
    """
    result = await db_session.execute(
        select(Skill).where(Skill.is_deleted == False)  # type: ignore[arg-type]  # noqa: E712
    )
    counter: Counter[str] = Counter()
    for skill in result.scalars().all():
        if skill.tags:
            counter.update(skill.tags)

    return {
        "items": [{"name": name, "usage_count": count} for name, count in counter.most_common(50)],
    }
