"""管理后台 API 路由."""
import csv
import io
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select

from app.api.deps import CurrentAdmin, DbDep
from app.models.comment import Comment
from app.models.skill import Skill
from app.models.tag import Tag

router = APIRouter()


class TagsMergeRequest(BaseModel):
    """标签合并请求."""

    source_tags: list[str]
    target_tag: str


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


@router.get("/export")
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
            created_at=datetime.now(UTC),
        )
        db.add(target_tag_obj)  # type: ignore[arg-type]
    else:
        target_tag_obj.usage_count = (target_tag_obj.usage_count or 0) + merged_count

    await db.commit()

    return {
        "merged_count": merged_count,
        "message": f"成功将 {len(source_tags_lower)} 个标签合并为 '{target_tag_lower}'",
    }
