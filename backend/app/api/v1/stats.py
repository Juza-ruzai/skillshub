"""公开统计 API 路由."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.models.skill import Skill
from app.models.user import User

router = APIRouter()


class PublicStatsResponse(BaseModel):
    """公开统计响应."""

    total_skills: int
    total_downloads: int
    total_users: int


@router.get("/public", response_model=PublicStatsResponse)
async def get_public_stats(
    db_session: AsyncSession = Depends(get_session),
) -> PublicStatsResponse:
    """获取平台公开统计数据（无需鉴权）."""
    total_skills_result = await db_session.execute(
        select(func.count(Skill.id)).where(Skill.is_deleted == False)  # type: ignore[arg-type]  # noqa: E712
    )
    total_skills = total_skills_result.scalar_one()

    total_downloads_result = await db_session.execute(
        select(func.coalesce(func.sum(Skill.download_count), 0)).where(
            Skill.is_deleted == False  # type: ignore[arg-type]  # noqa: E712
        )
    )
    total_downloads = total_downloads_result.scalar_one()

    total_users_result = await db_session.execute(
        select(func.count(User.id)).where(User.is_active == True)  # type: ignore[arg-type]  # noqa: E712
    )
    total_users = total_users_result.scalar_one()

    return PublicStatsResponse(
        total_skills=total_skills,
        total_downloads=total_downloads,
        total_users=total_users,
    )
