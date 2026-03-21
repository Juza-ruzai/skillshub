"""评论 API 路由."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbDep
from app.schemas.comment import CommentCreate, CommentWithReplies
from app.services.comment_service import CommentService

# 技能评论路由（获取和创建）
skill_comments_router = APIRouter()

# 评论操作路由（删除）
comments_router = APIRouter()


@skill_comments_router.get(
    "/",
    response_model=list[CommentWithReplies],
    summary="获取 Skill 的评论列表",
)
async def get_comments(
    skill_id: UUID,
    db: DbDep,
) -> list[CommentWithReplies]:
    """获取指定 Skill 的评论（嵌套结构）.

    只返回主评论，回复嵌套在 replies 字段中。

    Args:
        skill_id: Skill ID
        db: 数据库会话

    Returns:
        主评论列表（包含嵌套回复）
    """
    service = CommentService()
    return await service.get_comments_by_skill(db, skill_id)


@skill_comments_router.post(
    "/",
    response_model=CommentWithReplies,
    status_code=status.HTTP_201_CREATED,
    summary="发表评论或回复",
)
async def create_comment(
    skill_id: UUID,
    comment_data: CommentCreate,
    db: DbDep,
    current_user: CurrentUser,
) -> CommentWithReplies:
    """发表评论或回复.

    Args:
        skill_id: Skill ID
        comment_data: 评论数据
        db: 数据库会话
        current_user: 当前用户

    Returns:
        创建的评论
    """
    service = CommentService()
    comment = await service.create_comment(
        db_session=db,
        skill_id=skill_id,
        user_id=current_user.id,
        content=comment_data.content,
        parent_id=comment_data.parent_id,
    )
    response = CommentWithReplies.model_validate(comment)
    response.username = current_user.username
    return response


@comments_router.delete(
    "/{comment_id}",
    status_code=status.HTTP_200_OK,
    summary="删除评论",
)
async def delete_comment(
    comment_id: UUID,
    db: DbDep,
    current_user: CurrentUser,
) -> dict[str, str]:
    """软删除评论（仅作者或管理员可操作）.

    Args:
        comment_id: 评论 ID
        db: 数据库会话
        current_user: 当前用户

    Returns:
        成功消息

    Raises:
        HTTPException: 评论不存在或无权删除
    """
    service = CommentService()
    try:
        await service.delete_comment(
            db_session=db,
            comment_id=comment_id,
            user_id=current_user.id,
            is_admin=current_user.is_admin,
        )
        return {"message": "评论已删除"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
