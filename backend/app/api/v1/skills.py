"""Skill API 路由."""

from pathlib import Path
from typing import Any
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_user_optional
from app.core.database import get_session
from app.models.download_log import DownloadLog
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
from app.services.notification_service import NotificationService
from app.services.rating_service import RatingService
from app.services.skill_service import SkillService

router = APIRouter()
skill_service = SkillService()
rating_service = RatingService()
favorite_service = FavoriteService()
notification_service = NotificationService()


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
                cover_url=skill.cover_url,
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
            cover_url=skill.cover_url,
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
            cover_url=skill.cover_url,
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
            cover_url=skill.cover_url,
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

    # 如果是 zip，解压并构建文件树（只保存 children 数组，与前端 FileTreeNode[] 类型兼容）
    if new_file_path.lower().endswith(".zip"):
        file_service.extract_zip_file(skill.id, new_file_path)
        raw_tree = file_service.get_file_tree(skill.id)
        if raw_tree and isinstance(raw_tree, dict) and raw_tree.get("type") == "folder":
            skill.file_tree = raw_tree.get("children", [])
        elif raw_tree:
            skill.file_tree = [raw_tree]

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
        cover_url=skill.cover_url,
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

    # 通知所有收藏该 Skill 的用户（排除操作者本人）
    fav_result = await db_session.execute(
        select(Favorite.user_id).where(Favorite.skill_id == skill_id)  # type: ignore[call-overload]
    )
    fan_ids = [uid for uid in fav_result.scalars().all() if uid != current_user.id]
    if fan_ids:
        await notification_service.create_notifications_for_users(
            db_session,
            user_ids=fan_ids,
            notification_type="skill_update",
            skill_id=skill_id,
            message=f"你收藏的 Skill「{updated.name}」已更新",
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
    request: Request,
    db_session: AsyncSession = Depends(get_session),
    current_user: User | None = Depends(get_current_user_optional),
) -> dict[str, str]:
    """下载 Skill（增加下载计数并记录日志）."""
    skill = await skill_service.get_skill_by_id(db_session, skill_id)

    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 增加下载计数
    await skill_service.increment_download_count(db_session, skill_id)

    # 记录下载日志（登录用户记录 user_id，游客记录 IP）
    ip = request.client.host if request.client else None
    download_log = DownloadLog(
        skill_id=skill_id,
        user_id=current_user.id if current_user else None,
        ip_address=ip,
    )
    db_session.add(download_log)
    await db_session.commit()

    filename = Path(skill.file_path).name
    return {"download_url": f"/uploads/{skill_id}/{filename}"}


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


@router.get("/{skill_id}/files/{file_path:path}")
async def get_skill_file(
    skill_id: UUID,
    file_path: str,
    db_session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    """获取 Skill 包内指定文件的内容.

    用于预览 SKILL.md、README.md 等文本文件.
    """
    skill = await skill_service.get_skill_by_id(db_session, skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill 不存在",
        )

    # 安全检查：防止路径遍历攻击
    if ".." in file_path or file_path.startswith("/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="非法的文件路径",
        )

    # 构建文件完整路径（优先从 extracted 目录读取，兼容 zip 上传）
    upload_dir = Path(skill.file_path).parent
    extracted_dir = upload_dir / "extracted"
    full_path = extracted_dir / file_path if extracted_dir.exists() else upload_dir / file_path

    # 确保文件在允许的目录范围内
    try:
        full_path.resolve().relative_to(upload_dir.resolve())
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件路径超出允许范围",
        ) from e

    if not full_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在",
        )

    if not full_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不是有效的文件",
        )

    # 检查文件类型（只允许文本文件）
    allowed_extensions = {".md", ".txt", ".json", ".yaml", ".yml", ".py", ".js", ".ts", ".sh"}
    if full_path.suffix.lower() not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不支持的文件类型",
        )

    # 读取文件内容
    try:
        content = full_path.read_text(encoding="utf-8")
    except UnicodeDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无法解码文件内容（可能不是文本文件）",
        ) from e

    return {"content": content}


@router.post("/{skill_id}/content-images")
async def upload_content_image(
    skill_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    """上传编辑器内的图片.

    用于 usage_scenario 和 usage_method 编辑器中的图片上传.
    """
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
            detail="无权上传图片到该 Skill",
        )

    # 验证文件类型
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的图片格式，只允许: {', '.join(allowed_types)}",
        )

    # 读取文件内容
    content = await file.read()

    # 限制图片大小（最大 2MB）
    max_size = 2 * 1024 * 1024  # 2MB
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="图片大小超过限制（最大 2MB）",
        )

    # 保存图片到 content-images 目录
    upload_dir = Path(skill.file_path).parent / "content-images"
    upload_dir.mkdir(parents=True, exist_ok=True)

    # 生成唯一文件名
    import uuid

    ext = Path(file.filename or ".png").suffix
    if ext.lower() not in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
        ext = ".png"

    filename = f"{uuid.uuid4()}{ext}"
    file_path = upload_dir / filename

    file_path.write_bytes(content)

    # 返回可访问的 URL
    return {"url": f"/uploads/{skill_id}/content-images/{filename}"}


@router.post("/{skill_id}/cover")
async def upload_cover(
    skill_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db_session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    """上传 Skill 封面图片.

    封面图片用于在首页卡片和详情页展示。
    支持 jpg、png、webp 格式，最大 2MB。
    """
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
            detail="无权上传封面到该 Skill",
        )

    # 验证文件类型
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不支持的图片格式，只允许: jpg, png, webp",
        )

    # 读取文件内容
    content = await file.read()

    # 限制图片大小（最大 2MB）
    max_size = 2 * 1024 * 1024
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="图片大小超过限制（最大 2MB）",
        )

    # 保存封面到 skill 目录
    ext = Path(file.filename or ".png").suffix
    if ext.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
        ext = ".png"

    filename = f"cover{ext}"
    cover_path = Path(skill.file_path).parent / filename

    # 删除旧封面（如果存在不同扩展名）
    for old_ext in [".jpg", ".jpeg", ".png", ".webp"]:
        old_file = Path(skill.file_path).parent / f"cover{old_ext}"
        if old_file.exists() and old_file != cover_path:
            old_file.unlink()

    cover_path.write_bytes(content)

    # 更新数据库中的 cover_url
    cover_url = f"/uploads/{skill_id}/{filename}"
    skill.cover_url = cover_url
    db_session.add(skill)
    await db_session.commit()
    await db_session.refresh(skill)

    return {"cover_url": cover_url}
