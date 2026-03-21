"""用户 Schema 定义."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """用户基础字段."""

    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="用户名",
    )
    email: EmailStr = Field(..., description="邮箱")


class UserCreate(UserBase):
    """用户注册请求."""

    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
        description="密码",
    )


class UserLogin(BaseModel):
    """用户登录请求."""

    email: EmailStr = Field(..., description="邮箱")
    password: str = Field(..., description="密码")


class UserResponse(BaseModel):
    """用户响应数据."""

    id: UUID = Field(..., description="用户ID")
    username: str = Field(..., description="用户名")
    email: str = Field(..., description="邮箱")
    is_admin: bool = Field(default=False, description="是否管理员")
    is_active: bool = Field(default=True, description="是否启用")
    avatar_url: str | None = Field(default=None, description="头像URL")
    created_at: datetime = Field(..., description="创建时间")

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Token 响应数据."""

    access_token: str = Field(..., description="访问令牌")
    token_type: str = Field(default="bearer", description="令牌类型")
