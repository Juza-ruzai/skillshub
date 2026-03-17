"""用户服务层."""
from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.exceptions import ConflictException
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


class UserService:
    """用户服务类."""

    def __init__(self, db: AsyncSession) -> None:
        """初始化服务.

        Args:
            db: 数据库会话
        """
        self.db = db

    async def create_user(self, user_data: UserCreate) -> User:
        """创建新用户.

        Args:
            user_data: 用户创建数据

        Returns:
            创建的用户

        Raises:
            ConflictException: 邮箱或用户名已存在
        """
        # 检查邮箱是否已存在
        existing_email = await self._get_user_by_email(user_data.email)
        if existing_email:
            raise ConflictException("该邮箱已被注册")

        # 检查用户名是否已存在
        existing_username = await self._get_user_by_username(user_data.username)
        if existing_username:
            raise ConflictException("该用户名已被使用")

        # 创建用户
        user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def authenticate_user(self, email: str, password: str) -> User | None:
        """认证用户.

        Args:
            email: 邮箱
            password: 密码

        Returns:
            认证成功返回用户，失败返回 None
        """
        user = await self._get_user_by_email(email)
        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        """通过ID获取用户.

        Args:
            user_id: 用户ID

        Returns:
            用户或None
        """
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def _get_user_by_email(self, email: str) -> User | None:
        """通过邮箱获取用户（内部方法）.

        Args:
            email: 邮箱

        Returns:
            用户或None
        """
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def _get_user_by_username(self, username: str) -> User | None:
        """通过用户名获取用户（内部方法）.

        Args:
            username: 用户名

        Returns:
            用户或None
        """
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()
