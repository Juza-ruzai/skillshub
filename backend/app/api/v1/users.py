"""用户相关 API 路由."""

from datetime import date, timedelta
from typing import Any

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbDep
from app.models.comment import Comment
from app.models.favorite import Favorite
from app.models.rating import Rating
from app.models.skill import Skill
from app.models.user import User

router = APIRouter()


@router.get("/me/skills")
async def get_my_skills(
    current_user: CurrentUser,
    db: DbDep,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1),
) -> dict[str, Any]:
    """获取当前用户上传的 Skills.

    Args:
        current_user: 当前登录用户
        db: 数据库会话
        page: 页码
        page_size: 每页数量

    Returns:
        分页的 Skill 列表
    """
    offset = (page - 1) * page_size

    count_stmt = select(func.count(Skill.id)).where(
        Skill.author_id == current_user.id,
        Skill.is_deleted.is_(False),
    )
    total = (await db.execute(count_stmt)).scalar_one()

    stmt = (
        select(Skill)
        .where(Skill.author_id == current_user.id, Skill.is_deleted.is_(False))
        .order_by(Skill.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    skills = (await db.execute(stmt)).scalars().all()

    return {
        "items": [
            {
                "id": str(s.id),
                "name": s.name,
                "description": s.description,
                "tags": s.tags or [],
                "author_id": str(s.author_id),
                "author_username": current_user.username,
                "download_count": s.download_count,
                "view_count": s.view_count,
                "rating_avg": str(s.rating_avg),
                "rating_count": s.rating_count,
                "created_at": s.created_at.isoformat(),
                "is_deleted": s.is_deleted,
                "is_pinned": s.is_pinned,
            }
            for s in skills
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/me/favorites")
async def get_my_favorites(
    current_user: CurrentUser,
    db: DbDep,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1),
) -> dict[str, Any]:
    """获取当前用户收藏的 Skills.

    Args:
        current_user: 当前登录用户
        db: 数据库会话
        page: 页码
        page_size: 每页数量

    Returns:
        分页的收藏 Skill 列表
    """
    offset = (page - 1) * page_size

    count_stmt = (
        select(func.count(Skill.id))
        .join(Favorite, Favorite.skill_id == Skill.id)
        .where(Favorite.user_id == current_user.id, Skill.is_deleted.is_(False))
    )
    total = (await db.execute(count_stmt)).scalar_one()

    stmt = (
        select(Skill, User.username)
        .join(Favorite, Favorite.skill_id == Skill.id)
        .join(User, User.id == Skill.author_id)
        .where(Favorite.user_id == current_user.id, Skill.is_deleted.is_(False))
        .order_by(Favorite.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    rows = (await db.execute(stmt)).all()

    return {
        "items": [
            {
                "id": str(s.id),
                "name": s.name,
                "description": s.description,
                "tags": s.tags or [],
                "author_id": str(s.author_id),
                "author_username": username,
                "download_count": s.download_count,
                "view_count": s.view_count,
                "rating_avg": str(s.rating_avg),
                "rating_count": s.rating_count,
                "created_at": s.created_at.isoformat(),
            }
            for s, username in rows
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/me/comments")
async def get_my_comments(
    current_user: CurrentUser,
    db: DbDep,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1),
) -> dict[str, Any]:
    """获取当前用户发表的评论.

    Args:
        current_user: 当前登录用户
        db: 数据库会话
        page: 页码
        page_size: 每页数量

    Returns:
        分页的评论列表（含 skill_name）
    """
    offset = (page - 1) * page_size

    count_stmt = select(func.count(Comment.id)).where(
        Comment.user_id == current_user.id,
        Comment.is_deleted.is_(False),
    )
    total = (await db.execute(count_stmt)).scalar_one()

    stmt = (
        select(Comment, Skill.name)
        .join(Skill, Skill.id == Comment.skill_id)
        .where(Comment.user_id == current_user.id, Comment.is_deleted.is_(False))
        .order_by(Comment.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    rows = (await db.execute(stmt)).all()

    return {
        "items": [
            {
                "id": str(c.id),
                "skill_id": str(c.skill_id),
                "skill_name": skill_name,
                "user_id": str(c.user_id),
                "username": current_user.username,
                "content": c.content,
                "parent_id": str(c.parent_id) if c.parent_id else None,
                "is_deleted": c.is_deleted,
                "created_at": c.created_at.isoformat(),
                "updated_at": c.updated_at.isoformat(),
            }
            for c, skill_name in rows
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/me/stats")
async def get_user_stats(current_user: CurrentUser, db: DbDep) -> dict[str, Any]:
    """获取当前用户统计信息.

    Args:
        current_user: 当前登录用户
        db: 数据库会话

    Returns:
        用户统计数据
    """
    # 上传的 Skill 总数
    skills_count_stmt = select(func.count(Skill.id)).where(
        Skill.author_id == current_user.id,
        Skill.is_deleted.is_(False),
    )
    total_skills = (await db.execute(skills_count_stmt)).scalar_one()

    # 总浏览数 / 下载数
    stats_stmt = select(
        func.coalesce(func.sum(Skill.view_count), 0),
        func.coalesce(func.sum(Skill.download_count), 0),
    ).where(Skill.author_id == current_user.id, Skill.is_deleted.is_(False))
    stats_row = (await db.execute(stats_stmt)).one()
    total_pv = int(stats_row[0])
    total_downloads = int(stats_row[1])

    # 他人对作者 Skills 的收藏总数
    fav_stmt = (
        select(func.count(Favorite.skill_id))
        .join(Skill, Skill.id == Favorite.skill_id)
        .where(Skill.author_id == current_user.id)
    )
    total_favorites = (await db.execute(fav_stmt)).scalar_one()

    # 评分分布（1-5 星）
    rating_dist: dict[str, int] = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
    rating_stmt = (
        select(Rating.score, func.count(Rating.score))
        .join(Skill, Skill.id == Rating.skill_id)
        .where(Skill.author_id == current_user.id)
        .group_by(Rating.score)
    )
    rating_rows = (await db.execute(rating_stmt)).all()
    for score, count in rating_rows:
        rating_dist[str(score)] = count

    # 趋势数据（简化：返回结构，下载/浏览趋势均为 0）
    today = date.today()
    trend_7d = [
        {"date": str(today - timedelta(days=6 - i)), "pv": 0, "downloads": 0} for i in range(7)
    ]
    trend_30d = [
        {"date": str(today - timedelta(days=29 - i)), "pv": 0, "downloads": 0} for i in range(30)
    ]

    return {
        "total_skills": total_skills,
        "total_pv": total_pv,
        "total_downloads": total_downloads,
        "total_favorites": total_favorites,
        "rating_distribution": rating_dist,
        "trend_7d": trend_7d,
        "trend_30d": trend_30d,
    }
