"""数据库连接和会话管理."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.core.config import get_settings

settings = get_settings()

# 创建异步引擎
engine = create_async_engine(
    settings.database_url,
    echo=settings.environment == "development",
    future=True,
)

# 创建异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """获取数据库会话的依赖函数."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """初始化数据库（创建所有表）."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
