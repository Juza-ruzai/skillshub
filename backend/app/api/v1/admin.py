"""管理后台 API 路由."""

import csv
import io
from datetime import datetime, timedelta
from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import func, select

from app.api.deps import CurrentAdmin, DbDep
from app.models.comment import Comment
from app.models.download_log import DownloadLog
from app.models.skill import Skill
from app.models.tag import Tag
from app.models.user import User

router = APIRouter()


class TagsMergeRequest(BaseModel):
    """标签合并请求."""

    source_tags: list[str]
    target_tag: str


class SkillUpdateRequest(BaseModel):
    """Skill 更新请求."""

    name: str
    description: str
    usage_scenario: str
    usage_method: str
    tags: list[str]


class UserAdminStatusRequest(BaseModel):
    """用户管理员状态请求."""

    is_admin: bool


class UserActiveStatusRequest(BaseModel):
    """用户活跃状态请求."""

    is_active: bool


@router.post("/skills/{skill_id}/pin")
async def toggle_pin_skill(
    skill_id: UUID,
    db: DbDep,
    current_admin: CurrentAdmin,
) -> dict[str, Any]:
    """切换 Skill 置顶状态.

    Args:
        skill_id: Skill ID
        db: 数据库会话
        current_admin: 当前管理员

    Returns:
        更新后的 Skill 信息

    Raises:
        HTTPException: Skill 不存在
    """
    # 查询 Skill
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 切换置顶状态
    skill.is_pinned = not skill.is_pinned
    await db.commit()
    await db.refresh(skill)

    return {
        "id": str(skill.id),
        "name": skill.name,
        "is_pinned": skill.is_pinned,
    }


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_any_comment(
    comment_id: UUID,
    db: DbDep,
    current_admin: CurrentAdmin,
) -> None:
    """删除任意评论（管理员权限）.

    Args:
        comment_id: 评论 ID
        db: 数据库会话
        current_admin: 当前管理员

    Raises:
        HTTPException: 评论不存在
    """
    # 查询评论
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="评论不存在",
        )

    # 软删除评论
    comment.is_deleted = True
    await db.commit()


@router.get("/export/skills")
async def export_skills_csv(
    db: DbDep,
    current_admin: CurrentAdmin,
) -> StreamingResponse:
    """导出 Skills 为 CSV 格式.

    Args:
        db: 数据库会话
        current_admin: 当前管理员

    Returns:
        CSV 文件流
    """
    # 查询所有 Skill
    result = await db.execute(
        select(Skill).where(Skill.is_deleted == False).order_by(Skill.created_at.desc())  # noqa: E712
    )
    skills = result.scalars().all()

    # 创建 CSV 内容
    output = io.StringIO()
    writer = csv.writer(output)

    # 写入表头
    writer.writerow(
        [
            "id",
            "name",
            "description",
            "usage_scenario",
            "author_id",
            "tags",
            "download_count",
            "view_count",
            "rating_avg",
            "rating_count",
            "is_pinned",
            "created_at",
        ]
    )

    # 写入数据
    for skill in skills:
        writer.writerow(
            [
                str(skill.id),
                skill.name,
                skill.description,
                skill.usage_scenario,
                str(skill.author_id),
                ",".join(skill.tags) if skill.tags else "",
                skill.download_count,
                skill.view_count,
                float(skill.rating_avg) if skill.rating_avg else 0,
                skill.rating_count,
                skill.is_pinned,
                skill.created_at.isoformat() if skill.created_at else "",
            ]
        )

    # 重置指针
    output.seek(0)

    # 返回流式响应
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": "attachment; filename=skills_export.csv",
        },
    )


@router.get("/tags")
async def list_tags(
    db: DbDep,
    current_admin: CurrentAdmin,
) -> dict[str, Any]:
    """获取所有标签列表.

    Args:
        db: 数据库会话
        current_admin: 当前管理员

    Returns:
        标签列表
    """
    # 查询所有标签，按使用次数排序
    result = await db.execute(select(Tag).order_by(Tag.usage_count.desc()))
    tags = result.scalars().all()

    return {
        "items": [
            {
                "id": str(tag.id),
                "name": tag.name,
                "usage_count": tag.usage_count,
                "created_at": tag.created_at.isoformat() if tag.created_at else None,
            }
            for tag in tags
        ],
    }


@router.post("/tags/merge")
async def merge_tags(
    request: TagsMergeRequest,
    db: DbDep,
    current_admin: CurrentAdmin,
) -> dict[str, Any]:
    """合并标签.

    将 source_tags 中的所有标签合并到 target_tag。

    Args:
        request: 合并请求
        db: 数据库会话
        current_admin: 当前管理员

    Returns:
        合并结果
    """
    source_tags_lower = [t.lower().strip() for t in request.source_tags]
    target_tag_lower = request.target_tag.lower().strip()

    if not target_tag_lower:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="目标标签不能为空",
        )

    # 查询所有包含源标签的 Skills
    result = await db.execute(select(Skill))
    skills = result.scalars().all()

    merged_count = 0
    for skill in skills:
        if not skill.tags:
            continue

        skill_tags_lower = [t.lower() for t in skill.tags]
        has_source_tag = any(st in skill_tags_lower for st in source_tags_lower)

        if has_source_tag:
            # 移除源标签，添加目标标签
            new_tags = []
            for tag in skill.tags:
                if tag.lower() not in source_tags_lower:
                    new_tags.append(tag)

            # 添加目标标签（如果不存在）
            if target_tag_lower not in [t.lower() for t in new_tags]:
                new_tags.append(target_tag_lower)

            skill.tags = new_tags
            merged_count += 1

    await db.commit()

    # 更新标签表中的使用次数
    # 删除或减少源标签的使用次数
    for src_tag in source_tags_lower:
        tag_result = await db.execute(select(Tag).where(Tag.name == src_tag))
        tag_obj = tag_result.scalar_one_or_none()
        if tag_obj:
            await db.delete(tag_obj)

    # 确保目标标签存在
    target_result = await db.execute(select(Tag).where(Tag.name == target_tag_lower))
    target_tag_obj = target_result.scalar_one_or_none()
    if not target_tag_obj:
        target_tag_obj = Tag(
            name=target_tag_lower,
            usage_count=merged_count,
            created_at=datetime.utcnow(),
        )
        db.add(target_tag_obj)
    else:
        target_tag_obj.usage_count = (target_tag_obj.usage_count or 0) + merged_count

    await db.commit()

    return {
        "merged_count": merged_count,
        "message": f"成功将 {len(source_tags_lower)} 个标签合并为 '{target_tag_lower}'",
    }


# ========== Skill 管理扩展 ==========


@router.put("/skills/{skill_id}")
async def update_any_skill(
    skill_id: UUID,
    request: SkillUpdateRequest,
    db: DbDep,
    current_admin: CurrentAdmin,
) -> dict[str, Any]:
    """编辑任意 Skill（管理员权限）.

    Args:
        skill_id: Skill ID
        request: 更新请求
        db: 数据库会话
        current_admin: 当前管理员

    Returns:
        更新后的 Skill 信息

    Raises:
        HTTPException: Skill 不存在
    """
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 更新字段
    skill.name = request.name
    skill.description = request.description
    skill.usage_scenario = request.usage_scenario
    skill.usage_method = request.usage_method
    skill.tags = request.tags
    skill.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(skill)

    return {
        "id": str(skill.id),
        "name": skill.name,
        "description": skill.description,
        "usage_scenario": skill.usage_scenario,
        "usage_method": skill.usage_method,
        "tags": skill.tags,
        "updated_at": skill.updated_at.isoformat() if skill.updated_at else None,
    }


@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def force_delete_skill(
    skill_id: UUID,
    db: DbDep,
    current_admin: CurrentAdmin,
) -> None:
    """强制删除 Skill（物理删除，管理员权限）.

    Args:
        skill_id: Skill ID
        db: 数据库会话
        current_admin: 当前管理员

    Raises:
        HTTPException: Skill 不存在
    """
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 物理删除
    await db.delete(skill)
    await db.commit()


@router.get("/skills/deleted")
async def list_deleted_skills(
    db: DbDep,
    current_admin: CurrentAdmin,
    skip: int = 0,
    limit: int = 20,
) -> dict[str, Any]:
    """获取软删除 Skill 列表.

    Args:
        db: 数据库会话
        current_admin: 当前管理员
        skip: 跳过数量
        limit: 限制数量

    Returns:
        软删除 Skill 列表
    """
    result = await db.execute(
        select(Skill)
        .where(Skill.is_deleted == True)  # noqa: E712
        .order_by(Skill.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    skills = result.scalars().all()

    # 获取总数
    count_result = await db.execute(
        select(func.count()).select_from(Skill).where(Skill.is_deleted == True)  # noqa: E712
    )
    total = count_result.scalar()

    return {
        "items": [
            {
                "id": str(skill.id),
                "name": skill.name,
                "description": skill.description,
                "author_id": str(skill.author_id),
                "is_deleted": skill.is_deleted,
                "created_at": skill.created_at.isoformat() if skill.created_at else None,
                "updated_at": skill.updated_at.isoformat() if skill.updated_at else None,
            }
            for skill in skills
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("/skills/{skill_id}/restore")
async def restore_skill(
    skill_id: UUID,
    db: DbDep,
    current_admin: CurrentAdmin,
) -> dict[str, Any]:
    """恢复软删除的 Skill.

    Args:
        skill_id: Skill ID
        db: 数据库会话
        current_admin: 当前管理员

    Returns:
        恢复后的 Skill 信息

    Raises:
        HTTPException: Skill 不存在或未删除
    """
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    if not skill.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skill 未被删除",
        )

    skill.is_deleted = False
    skill.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(skill)

    return {
        "id": str(skill.id),
        "name": skill.name,
        "is_deleted": skill.is_deleted,
    }


@router.get("/skills/{skill_id}/downloads")
async def get_skill_downloads(
    skill_id: UUID,
    db: DbDep,
    current_admin: CurrentAdmin,
    skip: int = 0,
    limit: int = 50,
) -> dict[str, Any]:
    """获取 Skill 下载用户列表.

    Args:
        skill_id: Skill ID
        db: 数据库会话
        current_admin: 当前管理员
        skip: 跳过数量
        limit: 限制数量

    Returns:
        下载用户列表
    """
    # 验证 Skill 存在
    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 查询下载记录
    result = await db.execute(
        select(DownloadLog, User)
        .outerjoin(User, DownloadLog.user_id == User.id)
        .where(DownloadLog.skill_id == skill_id)
        .order_by(DownloadLog.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    logs = result.all()

    # 获取总数
    count_result = await db.execute(
        select(func.count()).select_from(DownloadLog).where(DownloadLog.skill_id == skill_id)
    )
    total = count_result.scalar()

    return {
        "items": [
            {
                "id": str(log.DownloadLog.id),
                "user_id": str(log.DownloadLog.user_id) if log.DownloadLog.user_id else None,
                "username": log.User.username if log.User else None,
                "ip_address": log.DownloadLog.ip_address,
                "created_at": log.DownloadLog.created_at.isoformat()
                if log.DownloadLog.created_at
                else None,
            }
            for log in logs
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


# ========== 用户管理 ==========


@router.get("/users")
async def list_users(
    db: DbDep,
    current_admin: CurrentAdmin,
    search: str | None = None,
    skip: int = 0,
    limit: int = 20,
) -> dict[str, Any]:
    """获取用户列表.

    Args:
        db: 数据库会话
        current_admin: 当前管理员
        search: 搜索关键词（用户名或邮箱）
        skip: 跳过数量
        limit: 限制数量

    Returns:
        用户列表
    """
    query = select(User)

    if search:
        query = query.where(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )

    # 获取总数
    count_query = select(func.count()).select_from(User)
    if search:
        count_query = count_query.where(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # 获取用户列表
    result = await db.execute(query.order_by(User.created_at.desc()).offset(skip).limit(limit))
    users = result.scalars().all()

    return {
        "items": [
            {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "is_admin": user.is_admin,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
            }
            for user in users
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.patch("/users/{user_id}/admin")
async def set_user_admin_status(
    user_id: UUID,
    request: UserAdminStatusRequest,
    db: DbDep,
    current_admin: CurrentAdmin,
) -> dict[str, Any]:
    """设置/取消用户管理员权限.

    Args:
        user_id: 用户 ID
        request: 管理员状态请求
        db: 数据库会话
        current_admin: 当前管理员

    Returns:
        更新后的用户信息

    Raises:
        HTTPException: 用户不存在
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在",
        )

    user.is_admin = request.is_admin
    await db.commit()
    await db.refresh(user)

    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin,
    }


@router.patch("/users/{user_id}/status")
async def set_user_active_status(
    user_id: UUID,
    request: UserActiveStatusRequest,
    db: DbDep,
    current_admin: CurrentAdmin,
) -> dict[str, Any]:
    """启用/禁用用户账号.

    Args:
        user_id: 用户 ID
        request: 活跃状态请求
        db: 数据库会话
        current_admin: 当前管理员

    Returns:
        更新后的用户信息

    Raises:
        HTTPException: 用户不存在
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在",
        )

    user.is_active = request.is_active
    await db.commit()
    await db.refresh(user)

    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active,
    }


# ========== 评论管理 ==========


@router.get("/comments")
async def list_comments(
    db: DbDep,
    current_admin: CurrentAdmin,
    skill_id: UUID | None = None,
    is_deleted: bool | None = None,
    skip: int = 0,
    limit: int = 20,
) -> dict[str, Any]:
    """获取评论列表.

    Args:
        db: 数据库会话
        current_admin: 当前管理员
        skill_id: 按 Skill ID 筛选
        is_deleted: 按删除状态筛选
        skip: 跳过数量
        limit: 限制数量

    Returns:
        评论列表
    """
    query = (
        select(Comment, User, Skill)
        .join(User, Comment.user_id == User.id)
        .join(Skill, Comment.skill_id == Skill.id)
    )

    if skill_id:
        query = query.where(Comment.skill_id == skill_id)

    if is_deleted is not None:
        query = query.where(Comment.is_deleted == is_deleted)

    # 获取总数
    count_query = select(func.count()).select_from(Comment)
    if skill_id:
        count_query = count_query.where(Comment.skill_id == skill_id)
    if is_deleted is not None:
        count_query = count_query.where(Comment.is_deleted == is_deleted)
    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # 获取评论列表
    result = await db.execute(query.order_by(Comment.created_at.desc()).offset(skip).limit(limit))
    comments = result.all()

    return {
        "items": [
            {
                "id": str(comment.Comment.id),
                "content": comment.Comment.content,
                "skill_id": str(comment.Comment.skill_id),
                "skill_name": comment.Skill.name,
                "user_id": str(comment.Comment.user_id),
                "username": comment.User.username,
                "is_deleted": comment.Comment.is_deleted,
                "created_at": comment.Comment.created_at.isoformat()
                if comment.Comment.created_at
                else None,
            }
            for comment in comments
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


# ========== 数据统计 ==========


@router.get("/stats/overview")
async def get_overview_stats(
    db: DbDep,
    current_admin: CurrentAdmin,
) -> dict[str, Any]:
    """获取平台概览统计.

    Args:
        db: 数据库会话
        current_admin: 当前管理员

    Returns:
        平台概览统计数据
    """
    # 总 Skills 数
    skills_result = await db.execute(
        select(func.count()).select_from(Skill).where(Skill.is_deleted == False)  # noqa: E712
    )
    total_skills = skills_result.scalar()

    # 总用户数
    users_result = await db.execute(select(func.count()).select_from(User))
    total_users = users_result.scalar()

    # 今日开始时间
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # 今日下载数
    today_downloads_result = await db.execute(
        select(func.count()).select_from(DownloadLog).where(DownloadLog.created_at >= today)
    )
    today_downloads = today_downloads_result.scalar()

    # 今日评论数
    today_comments_result = await db.execute(
        select(func.count()).select_from(Comment).where(Comment.created_at >= today)
    )
    today_comments = today_comments_result.scalar()

    # 今日上传数（按 Skill 创建时间）
    today_uploads_result = await db.execute(
        select(func.count()).select_from(Skill).where(Skill.created_at >= today)
    )
    today_uploads = today_uploads_result.scalar()

    return {
        "total_skills": total_skills,
        "total_users": total_users,
        "today_downloads": today_downloads,
        "today_comments": today_comments,
        "today_uploads": today_uploads,
    }


@router.get("/stats/active-users")
async def get_active_users(
    db: DbDep,
    current_admin: CurrentAdmin,
    days: int = Query(default=30, ge=1, le=365),
    limit: int = Query(default=20, ge=1, le=100),
) -> dict[str, Any]:
    """获取活跃用户榜单.

    Args:
        db: 数据库会话
        current_admin: 当前管理员
        days: 统计天数
        limit: 返回数量

    Returns:
        活跃用户榜单
    """
    since = datetime.utcnow() - timedelta(days=days)

    # 统计每个用户的下载、评论、上传数量
    result = await db.execute(
        select(
            User.id,
            User.username,
            func.count(func.distinct(DownloadLog.id)).label("download_count"),
            func.count(func.distinct(Comment.id)).label("comment_count"),
            func.count(func.distinct(Skill.id)).label("upload_count"),
        )
        .outerjoin(
            DownloadLog, (DownloadLog.user_id == User.id) & (DownloadLog.created_at >= since)
        )
        .outerjoin(Comment, (Comment.user_id == User.id) & (Comment.created_at >= since))
        .outerjoin(Skill, (Skill.author_id == User.id) & (Skill.created_at >= since))
        .group_by(User.id, User.username)
        .order_by(
            (
                func.count(func.distinct(DownloadLog.id))
                + func.count(func.distinct(Comment.id))
                + func.count(func.distinct(Skill.id))
            ).desc()
        )
        .limit(limit)
    )
    users = result.all()

    return {
        "items": [
            {
                "user_id": str(user.id),
                "username": user.username,
                "download_count": user.download_count,
                "comment_count": user.comment_count,
                "upload_count": user.upload_count,
                "total_score": user.download_count + user.comment_count + user.upload_count,
            }
            for user in users
        ],
        "days": days,
    }


@router.get("/export/users")
async def export_users_csv(
    db: DbDep,
    current_admin: CurrentAdmin,
) -> StreamingResponse:
    """导出用户 CSV.

    Args:
        db: 数据库会话
        current_admin: 当前管理员

    Returns:
        CSV 文件流
    """
    # 查询所有用户
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()

    # 创建 CSV 内容
    output = io.StringIO()
    writer = csv.writer(output)

    # 写入表头
    writer.writerow(["id", "username", "email", "is_admin", "is_active", "created_at"])

    # 写入数据
    for user in users:
        writer.writerow(
            [
                str(user.id),
                user.username,
                user.email,
                user.is_admin,
                user.is_active,
                user.created_at.isoformat() if user.created_at else "",
            ]
        )

    # 重置指针
    output.seek(0)

    # 返回流式响应
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": "attachment; filename=users_export.csv",
        },
    )


@router.get("/export/tags")
async def export_tags_csv(
    db: DbDep,
    current_admin: CurrentAdmin,
) -> StreamingResponse:
    """导出标签统计 CSV.

    Args:
        db: 数据库会话
        current_admin: 当前管理员

    Returns:
        CSV 文件流
    """
    # 查询所有标签
    result = await db.execute(select(Tag).order_by(Tag.usage_count.desc()))
    tags = result.scalars().all()

    # 创建 CSV 内容
    output = io.StringIO()
    writer = csv.writer(output)

    # 写入表头
    writer.writerow(["id", "name", "usage_count", "created_at"])

    # 写入数据
    for tag in tags:
        writer.writerow(
            [
                str(tag.id),
                tag.name,
                tag.usage_count,
                tag.created_at.isoformat() if tag.created_at else "",
            ]
        )

    # 重置指针
    output.seek(0)

    # 返回流式响应
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": "attachment; filename=tags_export.csv",
        },
    )
