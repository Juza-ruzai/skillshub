"""认证路由."""
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, DbDep, RefreshTokenDep
from app.core.config import get_settings
from app.core.exceptions import UnauthorizedException
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.schemas.user import TokenResponse, UserCreate, UserResponse
from app.services.user_service import UserService

router = APIRouter()
settings = get_settings()

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_MAX_AGE = settings.refresh_token_expire_days * 24 * 60 * 60


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="用户注册",
)
async def register(
    user_data: UserCreate,
    db: DbDep,
) -> UserResponse:
    """用户注册.

    Args:
        user_data: 用户注册数据
        db: 数据库会话

    Returns:
        创建的用户信息
    """
    user_service = UserService(db)
    user = await user_service.create_user(user_data)
    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="用户登录",
)
async def login(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DbDep,
) -> TokenResponse:
    """用户登录.

    Args:
        response: HTTP 响应（用于设置 Cookie）
        form_data: 登录表单数据
        db: 数据库会话

    Returns:
        Access Token

    Raises:
        UnauthorizedException: 认证失败
    """
    user_service = UserService(db)
    user = await user_service.authenticate_user(form_data.username, form_data.password)

    if not user:
        raise UnauthorizedException("邮箱或密码错误")

    # 创建 Access Token
    access_token = create_access_token(data={"sub": str(user.id)})

    # 创建 Refresh Token 并设置 Cookie
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_COOKIE_MAX_AGE,
        samesite="lax",
        secure=settings.environment == "production",
    )

    return TokenResponse(access_token=access_token)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="刷新 Access Token",
)
async def refresh_token(
    response: Response,
    refresh_token: RefreshTokenDep,
) -> TokenResponse:
    """刷新 Access Token.

    Args:
        response: HTTP 响应（用于设置新 Cookie）
        refresh_token: Refresh Token

    Returns:
        新的 Access Token

    Raises:
        UnauthorizedException: Refresh Token 无效
    """
    payload = decode_token(refresh_token)
    if not payload:
        raise UnauthorizedException("刷新令牌无效或已过期")

    token_type = payload.get("type")
    if token_type != "refresh":
        raise UnauthorizedException("令牌类型错误")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("令牌中无用户信息")

    # 创建新的 Access Token
    access_token = create_access_token(data={"sub": user_id})

    # 创建新的 Refresh Token（旋转刷新）
    new_refresh_token = create_refresh_token(data={"sub": user_id})
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=new_refresh_token,
        httponly=True,
        max_age=REFRESH_COOKIE_MAX_AGE,
        samesite="lax",
        secure=settings.environment == "production",
    )

    return TokenResponse(access_token=access_token)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="用户登出",
)
async def logout(
    response: Response,
    current_user: CurrentUser,
) -> dict[str, str]:
    """用户登出.

    Args:
        response: HTTP 响应（用于清除 Cookie）
        current_user: 当前用户

    Returns:
        登出成功消息
    """
    response.delete_cookie(key=REFRESH_COOKIE_NAME)
    return {"message": "登出成功"}


@router.get(
    "/me",
    response_model=UserResponse,
    summary="获取当前用户信息",
)
async def get_me(current_user: CurrentUser) -> UserResponse:
    """获取当前登录用户信息.

    Args:
        current_user: 当前用户

    Returns:
        用户信息
    """
    return UserResponse.model_validate(current_user)
