"""API 依赖注入."""

from collections.abc import AsyncGenerator
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, OAuth2PasswordBearer
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.core.exceptions import UnauthorizedException
from app.core.security import decode_token
from app.models.user import User
from app.services.user_service import UserService

# OAuth2 密码流（用于 Swagger UI）
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

# HTTP Bearer（用于 API 调用）
http_bearer = HTTPBearer(auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """获取数据库会话."""
    async for session in get_session():
        yield session  # type: ignore[misc]


DbDep = Annotated[AsyncSession, Depends(get_db)]


async def get_current_user(
    request: Request,
    db: DbDep,
    bearer: HTTPAuthorizationCredentials | None = Depends(http_bearer),  # noqa: B008
) -> User:
    """获取当前用户（从 JWT Token）.

    Args:
        request: HTTP 请求
        db: 数据库会话
        bearer: Bearer Token

    Returns:
        当前用户

    Raises:
        UnauthorizedException: Token 无效或过期
    """
    # 优先从 Authorization Header 获取
    token = None
    if bearer and bearer.credentials:
        token = bearer.credentials
    else:
        # 尝试从查询参数获取（用于某些特殊情况）
        token = request.query_params.get("token")

    if not token:
        raise UnauthorizedException("未提供认证令牌")

    # 解码 Token
    payload = decode_token(token)
    if not payload:
        raise UnauthorizedException("令牌无效或已过期")

    # 验证 Token 类型
    token_type = payload.get("type")
    if token_type != "access":
        raise UnauthorizedException("令牌类型错误")

    # 获取用户 ID
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedException("令牌中无用户信息")

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise UnauthorizedException("令牌中用户ID格式错误") from None

    # 查询用户
    user_service = UserService(db)
    user = await user_service.get_user_by_id(user_id)

    if not user:
        raise UnauthorizedException("用户不存在")

    # 检查用户是否被禁用
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已被禁用，请联系管理员",
        )

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


async def get_current_user_optional(
    request: Request,
    db: DbDep,
    bearer: HTTPAuthorizationCredentials | None = Depends(http_bearer),  # noqa: B008
) -> User | None:
    """获取当前用户（可选，未登录返回 None）.

    Args:
        request: HTTP 请求
        db: 数据库会话
        bearer: Bearer Token

    Returns:
        当前用户或 None
    """
    token = None
    if bearer and bearer.credentials:
        token = bearer.credentials
    else:
        token = request.query_params.get("token")

    if not token:
        return None

    payload = decode_token(token)
    if not payload:
        return None

    token_type = payload.get("type")
    if token_type != "access":
        return None

    user_id_str = payload.get("sub")
    if not user_id_str:
        return None

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        return None

    user_service = UserService(db)
    user = await user_service.get_user_by_id(user_id)

    return user


OptionalCurrentUser = Annotated[User | None, Depends(get_current_user_optional)]


async def get_current_admin(current_user: CurrentUser) -> User:
    """获取当前管理员用户.

    Args:
        current_user: 当前用户

    Returns:
        当前管理员用户

    Raises:
        HTTPException: 不是管理员
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="需要管理员权限",
        )
    return current_user


CurrentAdmin = Annotated[User, Depends(get_current_admin)]


async def get_refresh_token(request: Request) -> str:
    """从 Cookie 获取 Refresh Token.

    Args:
        request: HTTP 请求

    Returns:
        Refresh Token

    Raises:
        UnauthorizedException: 没有 Refresh Token
    """
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise UnauthorizedException("未提供刷新令牌")
    return refresh_token


RefreshTokenDep = Annotated[str, Depends(get_refresh_token)]
