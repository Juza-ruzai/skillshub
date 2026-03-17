# OpenClaw Skills Hub - 会话记忆

## 项目概况
- **项目名称**: OpenClaw Skills Hub
- **目标**: 中国建筑数字科技公司内部 AI Skills 共享平台 (约50人使用)
- **技术栈**: FastAPI + SQLModel (异步) + React + TypeScript + PostgreSQL
- **工作目录**: `D:\projects\openclaw-project`

## 当前进度
**M1 基础设施 ✅ 已完成 (100%)**
**M2 用户认证 ✅ 已完成 (100%)**
**M3 Skill 核心 ✅ 已完成 (100%)**
**M4 互动功能 ✅ 已完成 (100%)**
**M5 管理后台 ✅ 已完成 (100%)** - *2026-03-17 完成*
**M6 前端页面 🔴 未开始** - *下一步*

### M5 已完成内容（最新）

**后端路由：**
- `app/api/v1/admin.py` - 管理后台 API
  - `POST /api/v1/admin/skills/{id}/pin` - 置顶/取消置顶 Skill
  - `DELETE /api/v1/admin/comments/{id}` - 删除任意评论
  - `GET /api/v1/admin/export` - 导出 Skills CSV
  - `GET /api/v1/admin/tags` - 标签列表
  - `POST /api/v1/admin/tags/merge` - 合并标签

**API 端点：**
- `POST /api/v1/admin/skills/{id}/pin` - 切换置顶状态
- `DELETE /api/v1/admin/comments/{id}` - 删除任意评论（管理员权限）
- `GET /api/v1/admin/export` - 导出 CSV 报表
- `GET /api/v1/admin/tags` - 获取所有标签
- `POST /api/v1/admin/tags/merge` - 合并多个标签

**测试统计：**
- 单元测试：79 个
- 集成测试：52 个（含 12 个管理后台测试）
- 代码覆盖率：80%
- 全部通过：✅ 153 tests passed

### 下一步工作
**M6: 前端页面** (准备开始)
- 布局组件 (Header/Footer/Sidebar)
- 通用组件 (StarRating/Pagination/MarkdownPreview)
- 搜索功能
- Skill 上传/编辑页
- 个人中心

## 快速启动命令
```powershell
# 1. 启动数据库（如未运行）
docker-compose up -d postgres

# 2. 启动后端
cd D:\projects\openclaw-project\backend
.\venv\Scripts\Activate.ps1
python -m app.main
# 访问: http://localhost:8000/docs

# 3. 启动前端
cd D:\projects\openclaw-project\frontend
npm run dev
# 访问: http://localhost:5173
```

## 关键文件路径
| 用途 | 路径 |
|------|------|
| 项目根目录 | `D:\projects\openclaw-project` |
| 后端代码 | `backend/app/` |
| 前端代码 | `frontend/src/` |
| 后端主入口 | `backend/app/main.py` |
| 数据库配置 | `backend/app/core/database.py` |
| 安全工具 | `backend/app/core/security.py` |
| 认证路由 | `backend/app/api/v1/auth.py` |
| Skill 路由 | `backend/app/api/v1/skills.py` |
| 管理后台路由 | `backend/app/api/v1/admin.py` |
| Skill 服务 | `backend/app/services/skill_service.py` |
| 评分服务 | `backend/app/services/rating_service.py` |
| 收藏服务 | `backend/app/services/favorite_service.py` |
| 测试文件 | `backend/tests/` |
| 进度文档 | `PROGRESS.md` |

## 代码质量检查命令
```powershell
# 后端
cd backend
ruff check app tests    # ✅ All checks passed
mypy app               # SQLModel 类型存根警告（不影响运行）
pytest tests/ -v        # ✅ 153 tests passed

# 前端
cd frontend
npm run lint
npm run type-check
```

## 项目规范要点
- **后端**: 类型优先，纯函数，分层设计 (路由→服务→模型)
- **前端**: 禁止 `any`，使用 Tailwind CSS 变量，组件→Hooks→API 分层
- **命名**: Python 用 snake_case，TS 用 camelCase，类用 PascalCase
- **测试**: 使用 pytest，TDD 开发方式

## 参考文档
- `CLAUDE.md` - 编程规范
- `PRD.md` - 产品需求
- `ARCHITECTURE.md` - 架构设计
- `PROGRESS.md` - 项目进度（已更新 M5 完成）

# currentDate
Today's date is 2026-03-17.
