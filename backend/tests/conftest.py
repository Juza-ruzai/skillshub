"""Pytest 测试配置."""
import asyncio
from collections.abc import AsyncGenerator, Generator
from typing import Any
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

# 测试数据库 URL（使用文件 SQLite）
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# 创建测试引擎
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)

# 创建测试会话工厂
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


def override_database_module() -> None:
    """覆盖 database 模块中的引擎和会话工厂."""
    import app.core.database as db_module

    db_module.engine = test_engine
    db_module.AsyncSessionLocal = TestSessionLocal


def restore_database_module() -> None:
    """恢复 database 模块."""
    import app.core.database as db_module
    from app.core.config import get_settings

    settings = get_settings()
    db_module.engine = create_async_engine(
        settings.database_url,
        echo=settings.environment == "development",
        future=True,
    )
    db_module.AsyncSessionLocal = async_sessionmaker(
        bind=db_module.engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """创建事件循环."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    """设置测试数据库（创建所有表）."""
    import os

    # 删除旧的数据库文件
    if os.path.exists("test.db"):
        os.remove("test.db")

    # 先导入所有模型，确保元数据正确加载
    from app.models.comment import Comment  # noqa: F401
    from app.models.favorite import Favorite  # noqa: F401
    from app.models.notification import Notification  # noqa: F401
    from app.models.rating import Rating  # noqa: F401
    from app.models.skill import Skill  # noqa: F401
    from app.models.tag import Tag  # noqa: F401
    from app.models.user import User  # noqa: F401

    # 覆盖数据库模块
    override_database_module()

    # 创建所有表
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # 验证表已创建
    from sqlalchemy import inspect

    async with test_engine.connect() as conn:
        tables = await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names())
        print(f"\nCreated tables: {tables}")

    yield

    # 清理
    await test_engine.dispose()
    if os.path.exists("test.db"):
        os.remove("test.db")

    # 恢复数据库模块
    restore_database_module()


# 全局会话（用于所有测试）
_global_session: AsyncSession | None = None


@pytest_asyncio.fixture(scope="session")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """创建数据库会话（session 级别，所有测试共享）."""
    global _global_session
    if _global_session is None:
        _global_session = TestSessionLocal()
    yield _global_session


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """创建测试客户端."""
    from app.core.config import Settings, get_settings
    from app.core.database import get_session
    from app.main import app

    # 测试配置
    class TestSettings(Settings):
        """测试配置."""

        database_url: str = TEST_DATABASE_URL
        secret_key: str = "test-secret-key"
        access_token_expire_minutes: int = 15
        refresh_token_expire_days: int = 1

    def override_get_settings() -> TestSettings:
        return TestSettings()

    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_settings] = override_get_settings
    app.dependency_overrides[get_session] = override_get_session

    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport, base_url="http://test", follow_redirects=True
    ) as ac:
        yield ac

    # 清理依赖覆盖
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> dict[str, Any]:
    """创建测试用户."""
    from sqlalchemy import select

    from app.core.security import get_password_hash
    from app.models.user import User

    result = await db_session.execute(select(User).where(User.email == "test@example.com"))
    existing = result.scalar_one_or_none()
    if existing:
        return {
            "id": str(existing.id),
            "username": existing.username,
            "email": existing.email,
            "password": "Test123!",
            "is_admin": existing.is_admin,
        }

    user = User(
        id=uuid4(),
        username="testuser",
        email="test@example.com",
        password_hash=get_password_hash("Test123!"),
        is_admin=False,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "password": "Test123!",
        "is_admin": user.is_admin,
    }


@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession) -> dict[str, Any]:
    """创建测试管理员."""
    from sqlalchemy import select

    from app.core.security import get_password_hash
    from app.models.user import User

    result = await db_session.execute(select(User).where(User.email == "admin@example.com"))
    existing = result.scalar_one_or_none()
    if existing:
        return {
            "id": str(existing.id),
            "username": existing.username,
            "email": existing.email,
            "password": "Admin123!",
            "is_admin": existing.is_admin,
        }

    admin = User(
        id=uuid4(),
        username="adminuser",
        email="admin@example.com",
        password_hash=get_password_hash("Admin123!"),
        is_admin=True,
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)

    return {
        "id": str(admin.id),
        "username": admin.username,
        "email": admin.email,
        "password": "Admin123!",
        "is_admin": admin.is_admin,
    }


@pytest_asyncio.fixture
async def test_skill(db_session: AsyncSession, test_user: dict) -> dict[str, Any]:
    """创建测试 Skill."""
    from uuid import UUID

    from sqlalchemy import select

    from app.models.skill import Skill

    result = await db_session.execute(select(Skill).where(Skill.name == "Test Skill"))
    existing = result.scalar_one_or_none()
    if existing:
        return {
            "id": str(existing.id),
            "name": existing.name,
            "description": existing.description,
            "author_id": str(existing.author_id),
        }

    skill = Skill(
        name="Test Skill",
        description="A test skill for testing",
        usage_scenario="Testing",
        usage_method="Use for tests",
        file_path="/uploads/skills/test/test.zip",
        file_size=1024,
        author_id=UUID(test_user["id"]),
        tags=["test", "demo"],
    )
    db_session.add(skill)
    await db_session.commit()
    await db_session.refresh(skill)

    return {
        "id": str(skill.id),
        "name": skill.name,
        "description": skill.description,
        "author_id": str(skill.author_id),
    }


@pytest_asyncio.fixture
async def test_comment(db_session: AsyncSession, test_user: dict, test_skill: dict) -> dict[str, Any]:
    """创建测试评论."""
    from uuid import UUID

    from sqlalchemy import select

    from app.models.comment import Comment

    result = await db_session.execute(
        select(Comment).where(Comment.content == "Test comment content")
    )
    existing = result.scalar_one_or_none()
    if existing:
        return {
            "id": str(existing.id),
            "content": existing.content,
            "skill_id": str(existing.skill_id),
            "user_id": str(existing.user_id),
        }

    comment = Comment(
        content="Test comment content",
        skill_id=UUID(test_skill["id"]),
        user_id=UUID(test_user["id"]),
    )
    db_session.add(comment)
    await db_session.commit()
    await db_session.refresh(comment)

    return {
        "id": str(comment.id),
        "content": comment.content,
        "skill_id": str(comment.skill_id),
        "user_id": str(comment.user_id),
    }
