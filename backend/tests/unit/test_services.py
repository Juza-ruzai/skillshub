"""服务层单元测试."""
from typing import Any
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from sqlalchemy.ext.asyncio import AsyncSession


class TestUserService:
    """用户服务测试."""

    @pytest.fixture
    def mock_db(self) -> AsyncSession:
        """模拟数据库会话."""
        return MagicMock(spec=AsyncSession)

    @pytest.fixture
    def user_service(self, mock_db: AsyncSession) -> Any:
        """创建用户服务实例."""
        from app.services.user_service import UserService

        return UserService(mock_db)

    @pytest.mark.asyncio
    async def test_create_user_success(self, user_service: Any, mock_db: AsyncSession) -> None:
        """测试成功创建用户."""
        from app.schemas.user import UserCreate

        user_data = UserCreate(
            username="newuser",
            email="new@example.com",
            password="Secure123",
        )

        # 模拟两次数据库查询都返回空（邮箱和用户名都不存在）
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.side_effect = [mock_result, mock_result]

        # 模拟刷新后返回的用户
        mock_db.refresh.side_effect = lambda obj: setattr(obj, "id", uuid4())

        user = await user_service.create_user(user_data)

        assert user.username == "newuser"
        assert user.email == "new@example.com"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_user_duplicate_email(self, user_service: Any, mock_db: AsyncSession) -> None:
        """测试邮箱已存在."""
        from app.schemas.user import UserCreate

        user_data = UserCreate(
            username="newuser",
            email="exists@example.com",
            password="Secure123!",
        )

        # 模拟数据库查询返回已有用户
        existing_user = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = existing_user
        mock_db.execute.return_value = mock_result

        with pytest.raises(Exception) as exc_info:  # noqa: PT011
            await user_service.create_user(user_data)
        assert "邮箱已被注册" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_create_user_duplicate_username(self, user_service: Any, mock_db: AsyncSession) -> None:
        """测试用户名已存在."""
        from app.schemas.user import UserCreate

        user_data = UserCreate(
            username="existsuser",
            email="new@example.com",
            password="Secure123!",
        )

        # 第一次查询邮箱返回空，第二次查询用户名返回已有用户
        mock_result_email = MagicMock()
        mock_result_email.scalar_one_or_none.return_value = None
        mock_result_username = MagicMock()
        mock_result_username.scalar_one_or_none.return_value = MagicMock()

        mock_db.execute.side_effect = [mock_result_email, mock_result_username]

        with pytest.raises(Exception) as exc_info:  # noqa: PT011
            await user_service.create_user(user_data)
        assert "用户名已被使用" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_authenticate_user_success(self, user_service: Any, mock_db: AsyncSession) -> None:
        """测试成功认证用户."""
        from app.models.user import User

        # 创建模拟用户
        user = User(
            id=uuid4(),
            username="testuser",
            email="test@example.com",
            password_hash="$2b$12$test_hash",  # bcrypt hash
        )

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = user
        mock_db.execute.return_value = mock_result

        with patch("app.services.user_service.verify_password", return_value=True):
            result = await user_service.authenticate_user("test@example.com", "correct_password")

        assert result is not None
        assert result.email == "test@example.com"

    @pytest.mark.asyncio
    async def test_authenticate_user_wrong_password(self, user_service: Any, mock_db: AsyncSession) -> None:
        """测试密码错误."""
        from app.models.user import User

        user = User(
            id=uuid4(),
            username="testuser",
            email="test@example.com",
            password_hash="$2b$12$test_hash",
        )

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = user
        mock_db.execute.return_value = mock_result

        with patch("app.services.user_service.verify_password", return_value=False):
            result = await user_service.authenticate_user("test@example.com", "wrong_password")

        assert result is None

    @pytest.mark.asyncio
    async def test_authenticate_user_not_found(self, user_service: Any, mock_db: AsyncSession) -> None:
        """测试用户不存在."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await user_service.authenticate_user("notfound@example.com", "password")

        assert result is None

    @pytest.mark.asyncio
    async def test_get_user_by_id_success(self, user_service: Any, mock_db: AsyncSession) -> None:
        """测试通过ID获取用户."""
        from app.models.user import User

        user_id = uuid4()
        user = User(
            id=user_id,
            username="testuser",
            email="test@example.com",
            password_hash="hash",
        )

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = user
        mock_db.execute.return_value = mock_result

        result = await user_service.get_user_by_id(user_id)

        assert result is not None
        assert result.id == user_id

    @pytest.mark.asyncio
    async def test_get_user_by_id_not_found(self, user_service: Any, mock_db: AsyncSession) -> None:
        """测试用户ID不存在."""
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await user_service.get_user_by_id(uuid4())

        assert result is None
