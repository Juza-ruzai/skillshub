"""Schema 单元测试."""
import pytest
from pydantic import ValidationError


class TestUserSchemas:
    """用户 Schema 测试."""

    def test_user_create_valid(self) -> None:
        """测试有效的用户创建数据."""
        from app.schemas.user import UserCreate

        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "Test123!",
        }
        user = UserCreate(**data)
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.password == "Test123!"

    def test_user_create_invalid_email(self) -> None:
        """测试无效邮箱格式."""
        from app.schemas.user import UserCreate

        with pytest.raises(ValidationError) as exc_info:
            UserCreate(
                username="testuser",
                email="invalid-email",
                password="Test123!",
            )
        assert "email" in str(exc_info.value)

    def test_user_create_short_username(self) -> None:
        """测试用户名太短."""
        from app.schemas.user import UserCreate

        with pytest.raises(ValidationError) as exc_info:
            UserCreate(
                username="ab",  # 太短
                email="test@example.com",
                password="Test123!",
            )
        assert "username" in str(exc_info.value)

    def test_user_create_long_username(self) -> None:
        """测试用户名太长."""
        from app.schemas.user import UserCreate

        with pytest.raises(ValidationError) as exc_info:
            UserCreate(
                username="a" * 51,  # 超过 50
                email="test@example.com",
                password="Test123!",
            )
        assert "username" in str(exc_info.value)

    def test_user_create_short_password(self) -> None:
        """测试密码太短."""
        from app.schemas.user import UserCreate

        with pytest.raises(ValidationError) as exc_info:
            UserCreate(
                username="testuser",
                email="test@example.com",
                password="12345",  # 太短
            )
        assert "password" in str(exc_info.value)

    def test_user_login_valid(self) -> None:
        """测试有效的登录数据."""
        from app.schemas.user import UserLogin

        data = {
            "email": "test@example.com",
            "password": "Test123!",
        }
        login = UserLogin(**data)
        assert login.email == "test@example.com"
        assert login.password == "Test123!"

    def test_user_response_valid(self) -> None:
        """测试用户响应数据."""
        from datetime import UTC, datetime
        from uuid import uuid4

        from app.schemas.user import UserResponse

        user_id = uuid4()
        created_at = datetime.now(UTC)

        data = {
            "id": user_id,
            "username": "testuser",
            "email": "test@example.com",
            "is_admin": False,
            "avatar_url": None,
            "created_at": created_at,
        }
        user = UserResponse(**data)
        assert user.id == user_id
        assert user.username == "testuser"
        assert user.is_admin is False

    def test_user_response_excludes_password(self) -> None:
        """测试用户响应不包含密码."""
        from app.schemas.user import UserResponse

        # UserResponse 不应该有 password 字段
        assert "password" not in UserResponse.model_fields
        assert "password_hash" not in UserResponse.model_fields

    def test_token_response_valid(self) -> None:
        """测试 Token 响应数据."""
        from app.schemas.user import TokenResponse

        data = {
            "access_token": "test-access-token",
            "token_type": "bearer",
        }
        token = TokenResponse(**data)
        assert token.access_token == "test-access-token"
        assert token.token_type == "bearer"
