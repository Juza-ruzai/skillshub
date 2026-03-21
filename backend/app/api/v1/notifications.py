"""通知 API 路由."""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbDep
from app.schemas.notification import NotificationListResponse, NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter()


@router.get(
    "/",
    response_model=NotificationListResponse,
    summary="获取当前用户通知列表",
)
async def get_notifications(
    db: DbDep,
    current_user: CurrentUser,
    unread_only: bool = False,
) -> NotificationListResponse:
    """获取当前用户的通知.

    Args:
        db: 数据库会话
        current_user: 当前用户
        unread_only: 是否只获取未读

    Returns:
        通知列表和未读数量
    """
    service = NotificationService()
    notifications = await service.get_user_notifications(
        db_session=db,
        user_id=current_user.id,
        unread_only=unread_only,
    )
    unread_count = await service.get_unread_count(
        db_session=db,
        user_id=current_user.id,
    )

    return NotificationListResponse(
        notifications=[NotificationResponse.model_validate(n) for n in notifications],
        unread_count=unread_count,
    )


@router.patch(
    "/{notification_id}/read",
    status_code=status.HTTP_200_OK,
    summary="标记通知已读",
)
async def mark_as_read(
    notification_id: str,
    db: DbDep,
    current_user: CurrentUser,
) -> dict[str, str]:
    """标记单条通知已读.

    Args:
        notification_id: 通知 ID
        db: 数据库会话
        current_user: 当前用户

    Returns:
        成功消息
    """
    from uuid import UUID

    service = NotificationService()
    try:
        await service.mark_as_read(
            db_session=db,
            notification_id=UUID(notification_id),
            user_id=current_user.id,
        )
        return {"message": "通知已标记为已读"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e


@router.post(
    "/read-all",
    status_code=status.HTTP_200_OK,
    summary="标记所有通知已读",
)
async def mark_all_as_read(
    db: DbDep,
    current_user: CurrentUser,
) -> dict[str, int]:
    """标记当前用户所有通知已读.

    Args:
        db: 数据库会话
        current_user: 当前用户

    Returns:
        更新的通知数量
    """
    service = NotificationService()
    count = await service.mark_all_as_read(
        db_session=db,
        user_id=current_user.id,
    )
    return {"marked_count": count}
