"""Skill API 路由."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_user_optional
from app.core.database import get_session
from app.models.favorite import Favorite
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.skill import (
    FavoriteResponse,
    RatingCreate,
    RatingResponse,
    SkillDetailResponse,
    SkillFilterParams,
    SkillListResponse,
    SkillResponse,
    SkillUpdate,
)
from app.services.favorite_service import FavoriteService
from app.services.file_service import FileService
from app.services.rating_service import RatingService
from app.services.skill_service import SkillService

router = APIRouter()
skill_service = SkillService()
rating_service = RatingService()
favorite_service = FavoriteService()


async def _get_author_usernames(
    db_session: AsyncSession,
    author_ids: set[UUID],
) -> dict[UUID, str]:
    """批量获取作者用户名.

    Args:
        db_session: 数据库会话
        author_ids: 作者 ID 集合

    Returns:
        作者 ID 到用户名的映射
    """
    if not author_ids:
        return {}

    from sqlalchemy import column

    result: Any = await db_session.execute(
        select(column("id"), column("username")).select_from(User).where(User.id.in_(author_ids))  # type: ignore[attr-defined]
    )
    return dict(result.all())


async def _get_favorite_counts(
    db_session: AsyncSession,
    skill_ids: set[UUID],
) -> dict[UUID, int]:
    """批量获取 Skill 收藏数."""
    if not skill_ids:
        return {}
    result = await db_session.execute(
        select(Favorite.skill_id, func.count(Favorite.user_id).label("cnt"))  # type: ignore[arg-type, call-overload]
        .where(Favorite.skill_id.in_(skill_ids))  # type: ignore[attr-defined]
        .group_by(Favorite.skill_id)
    )
    return {row.skill_id: row.cnt for row in result.all()}


@router.get("", response_model=PaginatedResponse[SkillListResponse])
async def list_skills(
    params: SkillFilterParams = Depends(),
    db_session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """获取 Skill 列表（支持搜索、筛选、分页）."""
    skills, total = await skill_service.search_skills(
        db_session,
        search=params.search,
        tag=params.tag,
        sort_by=params.sort_by,
        page=params.page,
        page_size=params.page_size,
    )

    # 批量获取作者用户名
    author_ids = {skill.author_id for skill in skills}
    author_map = await _get_author_usernames(db_session, author_ids)

    # 批量获取收藏数
    skill_ids = {skill.id for skill in skills}
    favorite_map = await _get_favorite_counts(db_session, skill_ids)

    # 转换为响应模型
    items = []
    for skill in skills:
        items.append(
            SkillListResponse(
                id=skill.id,
                name=skill.name,
                description=skill.description,
                tags=skill.tags,
                author_id=skill.author_id,
                author_username=author_map.get(skill.author_id, "未知用户"),
                download_count=skill.download_count,
                favorite_count=favorite_map.get(skill.id, 0),
                rating_avg=float(skill.rating_avg),
                rating_count=skill.rating_count,
                created_at=skill.created_at,
            )
        )

    return {
        "items": items,
        "total": total,
        "page": params.page,
        "page_size": params.page_size,
    }


@router.get("/trending", response_model=PaginatedResponse[SkillListResponse])
async def get_trending_skills(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db_session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """获取本周热门 Skills."""
    skills = await skill_service.get_trending_skills(db_session, limit=page_size)

    author_ids = {skill.author_id for skill in skills}
    author_map = await _get_author_usernames(db_session, author_ids)
    skill_ids = {skill.id for skill in skills}
    favorite_map = await _get_favorite_counts(db_session, skill_ids)

    items = [
        SkillListResponse(
            id=skill.id,
            name=skill.name,
            description=skill.description,
            tags=skill.tags,
            author_id=skill.author_id,
            author_username=author_map.get(skill.author_id, "未知用户"),
            download_count=skill.download_count,
            favorite_count=favorite_map.get(skill.id, 0),
            rating_avg=float(skill.rating_avg),
            rating_count=skill.rating_count,
            created_at=skill.created_at,
        )
        for skill in skills
    ]
    return {"items": items, "total": len(items), "page": page, "page_size": page_size}


@router.get("/top-rated", response_model=PaginatedResponse[SkillListResponse])
async def get_top_rated_skills(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db_session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """获取评分最高 Skills."""
    skills = await skill_service.get_top_rated_skills(db_session, limit=page_size)

    author_ids = {skill.author_id for skill in skills}
    author_map = await _get_author_usernames(db_session, author_ids)
    skill_ids = {skill.id for skill in skills}
    favorite_map = await _get_favorite_counts(db_session, skill_ids)

    items = [
        SkillListResponse(
            id=skill.id,
            name=skill.name,
            description=skill.description,
            tags=skill.tags,
            author_id=skill.author_id,
            author_username=author_map.get(skill.author_id, "未知用户"),
            download_count=skill.download_count,
            favorite_count=favorite_map.get(skill.id, 0),
            rating_avg=float(skill.rating_avg),
            rating_count=skill.rating_count,
            created_at=skill.created_at,
        )
        for skill in skills
    ]
    return {"items": items, "total": len(items), "page": page, "page_size": page_size}


@router.get("/most-downloaded", response_model=PaginatedResponse[SkillListResponse])
async def get_most_downloaded_skills(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db_session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """获取下载最多 Skills."""
    skills = await skill_service.get_most_downloaded_skills(db_session, limit=page_size)

    author_ids = {skill.author_id for skill in skills}
    author_map = await _get_author_usernames(db_session, author_ids)
    skill_ids = {skill.id for skill in skills}
    favorite_map = await _get_favorite_counts(db_session, skill_ids)

    items = [
        SkillListResponse(
            id=skill.id,
            name=skill.name,
            description=skill.description,
            tags=skill.tags,
            author_id=skill.author_id,
            author_username=author_map.get(skill.author_id, "未知用户"),
            download_count=skill.download_count,
            favorite_count=favorite_map.get(skill.id, 0),
            rating_avg=float(skill.rating_avg),
            rating_count=skill.rating_count,
            created_at=skill.created_at,
        )
        for skill in skills
    ]
    return {"items": items, "total": len(items), "page": page, "page_size": page_size}


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
async def create_skill(
    name: str = Form(...),
    description: str = Form(...),
    usage_scenario: str = Form(...),
    usage_method: str = Form(...),
    tags: list[str] = Form(default=[]),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_session),
) -> SkillResponse:
    """上传新 Skill."""
    # 验证文件类型
    file_service = FileService()
    if not file_service.validate_file_type(file.filename or ""):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不支持的文件类型",
        )

    # 读取文件内容
    content = await file.read()

    # 验证文件大小
    if not file_service.validate_file_size(len(content)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件大小超过限制（最大 50MB）",
        )

    # 保存文件
    file_path = file_service.save_upload_file(
        skill_id=UUID(int=0),  # 临时 ID
        content=content,
        filename=file.filename or "package.zip",
    )

    skill_data_dict = {
        "name": name,
        "description": description,
        "usage_scenario": usage_scenario,
        "usage_method": usage_method,
        "tags": tags,
    }

    # 创建 Skill
    skill = await skill_service.create_skill(
        db_session,
        skill_data=skill_data_dict,
        author_id=current_user.id,
        file_path=file_path,
        file_size=len(content),
    )

    # 重新保存文件到正确位置
    new_file_path = file_service.save_upload_file(
        skill_id=skill.id,
        content=content,
        filename=file.filename or "package.zip",
    )

    # 更新文件路径
    skill.file_path = new_file_path
    await db_session.commit()

    return SkillResponse.model_validate(skill)


@router.get("/{skill_id}", response_model=SkillDetailResponse)
async def get_skill_detail(
    skill_id: UUID,
    current_user: User | None = Depends(get_current_user_optional),
    db_session: AsyncSession = Depends(get_session),
) -> SkillDetailResponse:
    """获取 Skill 详情."""
    skill = await skill_service.get_skill_by_id(db_session, skill_id)

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 在 commit 前保存 author_id，避免被 session commit 影响
    author_id = skill.author_id

    # 增加浏览计数
    await skill_service.increment_view_count(db_session, skill_id)

    # 查询是否已收藏、用户评分
    is_favorite = False
    user_rating = None

    if current_user:
        is_favorite = await favorite_service.is_favorited(
            db_session,
            skill_id=skill_id,
            user_id=current_user.id,
        )
        user_rating = await rating_service.get_user_rating(
            db_session,
            skill_id=skill_id,
            user_id=current_user.id,
        )

    # 查询作者用户名
    author_map = await _get_author_usernames(db_session, {author_id})
    author_username = author_map.get(author_id, "未知用户")

    # 查询收藏数
    favorite_count = await favorite_service.get_favorite_count(db_session, skill_id=skill_id)

    return SkillDetailResponse(
        id=skill.id,
        name=skill.name,
        description=skill.description,
        usage_scenario=skill.usage_scenario,
        usage_method=skill.usage_method,
        demo_images=skill.demo_images,
        file_path=skill.file_path,
        file_size=skill.file_size,
        file_tree=skill.file_tree,
        tags=skill.tags,
        author_id=skill.author_id,
        author_username=author_username,
        is_favorite=is_favorite,
        user_rating=user_rating,
        download_count=skill.download_count,
        view_count=skill.view_count + 1,
        favorite_count=favorite_count,
        rating_avg=float(skill.rating_avg),
        rating_count=skill.rating_count,
        created_at=skill.created_at,
        updated_at=skill.updated_at,
    )


@router.put("/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: UUID,
    update_data: SkillUpdate,
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_session),
) -> SkillResponse:
    """更新 Skill."""
    skill = await skill_service.get_skill_by_id(db_session, skill_id)

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 检查权限（作者或管理员）
    if skill.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权修改此 Skill",
        )

    updated = await skill_service.update_skill(
        db_session,
        skill=skill,
        update_data=update_data.model_dump(exclude_none=True),
    )

    return SkillResponse.model_validate(updated)


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: UUID,
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_session),
) -> None:
    """删除 Skill（软删除）."""
    skill = await skill_service.get_skill_by_id(db_session, skill_id)

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 检查权限
    if skill.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权删除此 Skill",
        )

    await skill_service.delete_skill(db_session, skill)


@router.post("/{skill_id}/download")
async def download_skill(
    skill_id: UUID,
    db_session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    """下载 Skill（增加下载计数）."""
    skill = await skill_service.get_skill_by_id(db_session, skill_id)

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 增加下载计数
    await skill_service.increment_download_count(db_session, skill_id)

    # TODO: 返回文件下载链接
    return {"download_url": f"/api/v1/files/{skill_id}/package.zip"}


@router.post("/{skill_id}/rate", response_model=RatingResponse)
async def rate_skill(
    skill_id: UUID,
    rating_data: RatingCreate,
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_session),
) -> RatingResponse:
    """评分 Skill（首次评分或更新评分）."""
    # 检查 Skill 是否存在
    skill = await skill_service.get_skill_by_id(db_session, skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 创建或更新评分
    try:
        rating = await rating_service.rate_skill(
            db_session,
            skill_id=skill_id,
            user_id=current_user.id,
            score=rating_data.score,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from None

    # 更新 Skill 的评分统计
    await skill_service.update_rating_stats(db_session, skill_id)

    return RatingResponse.model_validate(rating)


@router.post("/{skill_id}/favorite", response_model=FavoriteResponse)
async def toggle_favorite(
    skill_id: UUID,
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_session),
) -> FavoriteResponse:
    """收藏/取消收藏 Skill（切换状态）."""

    # 检查 Skill 是否存在
    skill = await skill_service.get_skill_by_id(db_session, skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 切换收藏状态
    is_favorited, favorite = await favorite_service.toggle_favorite(
        db_session,
        skill_id=skill_id,
        user_id=current_user.id,
    )

    if favorite:
        return FavoriteResponse(
            user_id=current_user.id,
            skill_id=skill_id,
            is_favorited=True,
            created_at=favorite.created_at,
        )
    else:
        # 取消收藏时返回
        return FavoriteResponse(
            user_id=current_user.id,
            skill_id=skill_id,
            is_favorited=False,
            created_at=None,
        )
