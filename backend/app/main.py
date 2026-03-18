"""FastAPI 应用入口."""
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.comments import comments_router, skill_comments_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.skills import router as skills_router
from app.api.v1.tags import router as tags_router
from app.api.v1.users import router as users_router
from app.core.config import get_settings
from app.core.database import init_db
from app.core.exceptions import OpenClawException

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """应用生命周期管理."""
    # 启动时创建上传目录
    upload_path = settings.upload_path
    upload_path.mkdir(parents=True, exist_ok=True)
    (upload_path / "skills").mkdir(exist_ok=True)

    # 初始化数据库
    await init_db()

    yield

    # 关闭时的清理工作（如果有）


app = FastAPI(
    title="OpenClaw Skills Hub API",
    description="中国建筑数字科技公司 AI Skills 共享平台 API",
    version="1.0.0",
    lifespan=lifespan,
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册 API 路由
app.include_router(auth_router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(skills_router, prefix="/api/v1/skills", tags=["Skills"])
# 评论路由（获取和创建）
app.include_router(
    skill_comments_router,
    prefix="/api/v1/skills/{skill_id}/comments",
    tags=["评论"],
)
# 评论删除路由
app.include_router(comments_router, prefix="/api/v1/comments", tags=["评论"])
# 通知路由
app.include_router(
    notifications_router, prefix="/api/v1/users/me/notifications", tags=["通知"]
)
# 管理后台路由
app.include_router(admin_router, prefix="/api/v1/admin", tags=["管理后台"])
# 用户路由
app.include_router(users_router, prefix="/api/v1/users", tags=["用户"])
# 标签路由（公开访问）
app.include_router(tags_router, prefix="/api/v1/tags", tags=["标签"])

# 静态文件服务（上传的文件）
app.mount("/uploads", StaticFiles(directory=str(settings.upload_path)), name="uploads")


# 全局异常处理
@app.exception_handler(OpenClawException)
async def openclaw_exception_handler(request: Request, exc: OpenClawException) -> JSONResponse:
    """处理自定义异常."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.get("/")
async def root() -> dict[str, str]:
    """根路由 - 健康检查."""
    return {"message": "OpenClaw Skills Hub API", "version": "1.0.0"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """健康检查端点."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
