# OpenClaw Skills Hub - 架构设计文档

> 版本：v1.0
> 日期：2026-03-17
> 状态：已确认

---

## 1. 概述

### 1.1 项目背景

OpenClaw Skills Hub 是中国建筑数字科技公司内部的 AI Skills 共享与交流平台，目标用户约 50 人。本文档定义了系统的整体架构设计，用于指导后续开发工作。

### 1.2 设计原则

1. **简单优先**：个人开发和演示阶段，避免过度设计
2. **前后端分离**：清晰的 API 边界，便于独立开发和测试
3. **可演进**：架构支持未来扩展（缓存、异步任务、云存储等）
4. **类型安全**：全链路类型定义（TypeScript + Pydantic）

---

## 2. 技术栈选型

### 2.1 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.11+ | 运行时 |
| FastAPI | 最新 | Web 框架 |
| SQLModel | 最新 | ORM（基于 SQLAlchemy 2.0） |
| Pydantic | v2 | 数据校验 |
| PostgreSQL | 15+ | 数据库 |
| asyncpg | 最新 | 异步 PostgreSQL 驱动 |
| Alembic | 最新 | 数据库迁移 |
| python-jose | 最新 | JWT 处理 |
| passlib | 最新 | 密码加密（bcrypt） |
| python-multipart | 最新 | 文件上传处理 |

### 2.2 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18+ | UI 框架 |
| TypeScript | 5+ | 类型系统 |
| Vite | 最新 | 构建工具 |
| Tailwind CSS | 最新 | 样式框架 |
| shadcn/ui | 最新 | 组件库 |
| Lucide React | 最新 | 图标库 |
| React Query | 最新 | 数据获取和缓存 |
| React Router | 最新 | 路由管理 |

### 2.3 开发/部署工具

| 技术 | 用途 |
|------|------|
| Docker + Docker Compose | 本地 PostgreSQL 服务 |
| Ruff | Python 代码格式化/Lint |
| MyPy | Python 类型检查 |
| ESLint + Prettier | 前端代码规范 |

---

## 3. 系统架构

### 3.1 部署架构

```
┌─────────────────┐     CORS      ┌─────────────────┐
│   React (5173)  │ ◄────────────► │  FastAPI (8000) │
│   Vite Dev      │                │  + 静态文件服务  │
└─────────────────┘                └────────┬────────┘
                                            │
                                            │ asyncpg
                                            ▼
                                    ┌─────────────────┐
                                    │  PostgreSQL     │
                                    │  (Docker 5432)  │
                                    └─────────────────┘
```

### 3.2 开发环境启动流程

```bash
# 1. 启动数据库
docker-compose up -d postgres

# 2. 启动后端
cd backend
python -m app.main

# 3. 启动前端
cd frontend
npm run dev
```

---

## 4. 目录结构

```
openclaw-project/
├── backend/
│   ├── alembic/                    # 数据库迁移脚本
│   │   ├── versions/               # 迁移版本
│   │   └── env.py                  # Alembic 配置
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI 入口
│   │   ├── core/                   # 核心配置
│   │   │   ├── __init__.py
│   │   │   ├── config.py           # Pydantic Settings 配置
│   │   │   ├── database.py         # 数据库连接和会话
│   │   │   ├── security.py         # JWT、密码加密、认证依赖
│   │   │   └── exceptions.py       # 自定义异常类
│   │   ├── models/                 # SQLModel 数据模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── skill.py
│   │   │   ├── comment.py
│   │   │   ├── favorite.py
│   │   │   ├── rating.py
│   │   │   ├── notification.py
│   │   │   └── tag.py
│   │   ├── schemas/                # Pydantic 校验模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── skill.py
│   │   │   ├── comment.py
│   │   │   └── common.py           # 分页、通用响应
│   │   ├── api/                    # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── deps.py             # 依赖注入（获取当前用户等）
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py         # 认证接口
│   │   │       ├── skills.py       # Skill CRUD + 榜单
│   │   │       ├── comments.py     # 评论系统
│   │   │       ├── users.py        # 用户相关
│   │   │       ├── files.py        # 文件访问
│   │   │       └── admin.py        # 管理员功能
│   │   └── services/               # 业务逻辑层
│   │       ├── __init__.py
│   │       ├── skill_service.py
│   │       ├── user_service.py
│   │       ├── comment_service.py
│   │       ├── rating_service.py
│   │       └── file_service.py
│   ├── uploads/                    # 文件存储（gitignore）
│   │   └── skills/
│   │       └── {skill_id}/         # 按 Skill ID 分组
│   │           ├── package.zip     # Skill 压缩包
│   │           └── images/         # 演示图片
│   │               ├── demo-1.png
│   │               └── demo-2.gif
│   ├── .env.backend                # 后端环境变量
│   ├── requirements.txt
│   └── alembic.ini                 # Alembic 配置
├── frontend/
│   ├── src/
│   │   ├── components/             # 通用组件
│   │   │   ├── ui/                 # shadcn/ui 组件
│   │   │   └── common/             # 项目公共组件
│   │   ├── pages/                  # 页面组件
│   │   │   ├── Home.tsx
│   │   │   ├── SkillDetail.tsx
│   │   │   ├── SkillUpload.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   └── Login.tsx
│   │   ├── hooks/                  # 自定义 Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useSkills.ts
│   │   │   └── useApi.ts
│   │   ├── lib/                    # 工具函数和 API 客户端
│   │   │   ├── api.ts              # axios/fetch 封装
│   │   │   └── utils.ts
│   │   ├── types/                  # TypeScript 类型定义
│   │   │   ├── user.ts
│   │   │   ├── skill.ts
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.frontend               # 前端环境变量
│   └── package.json
├── docker-compose.yml              # PostgreSQL 服务定义
└── docs/
    └── ARCHITECTURE.md             # 本文档
```

---

## 5. 数据库设计

### 5.1 ER 图

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  users   │◄─────►│  skills  │◄─────►│ comments │
│          │  1:N  │          │  1:N   │          │
│          │       │          │◄───────┤ parent   │
│          │◄─────►│          │  N:1   │          │
│          │  1:N  │          │       └──────────┘
│          │       │          │
│          │◄─────►│          │◄─────►┌──────────┐
│          │ 1:N   │          │  1:N  │ favorites│
│          │(author)│         │       │(联合PK)  │
│          │       │          │       └──────────┘
│          │◄─────►│          │
│          │ 1:N   │          │◄─────►┌──────────┐
│          │(author)│         │  1:N  │  ratings │
│          │       │          │       │(联合PK)  │
└──────────┘       └──────────┘       └──────────┘
       ▲                ▲
       │                │
       │           ┌────┴────┐
       │           │notifications
       │           │  (1:N)  │
       │           └─────────┘
       │
  ┌────┴────┐
  │  tags   │  ←── 独立表，skills.tags 存储标签名数组
  │(管理用) │
  └─────────┘
```

### 5.2 表结构定义

#### users（用户表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱，用于登录 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 加密后的密码 |
| is_admin | BOOLEAN | DEFAULT FALSE | 是否管理员 |
| avatar_url | VARCHAR(500) | NULL | 头像 URL |
| created_at | TIMESTAMP | DEFAULT NOW() | 注册时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

#### skills（Skill 表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| name | VARCHAR(100) | NOT NULL | Skill 名称 |
| description | TEXT | NOT NULL | 简介描述 |
| usage_scenario | TEXT | NOT NULL | 使用场景 |
| usage_method | TEXT | NOT NULL | 使用方法（Markdown） |
| demo_images | JSONB | DEFAULT '[]' | 效果演示图片数组 `[{url, caption}]` |
| file_path | VARCHAR(500) | NOT NULL | 文件存储相对路径 |
| file_size | INTEGER | NOT NULL | 文件大小（字节） |
| file_tree | JSONB | NULL | 文件结构树（解压后分析） |
| tags | JSONB | DEFAULT '[]' | 标签数组 |
| author_id | UUID | FK → users.id | 作者 ID |
| is_deleted | BOOLEAN | DEFAULT FALSE | 软删除标记 |
| is_pinned | BOOLEAN | DEFAULT FALSE | 是否置顶 |
| download_count | INTEGER | DEFAULT 0 | 下载次数 |
| view_count | INTEGER | DEFAULT 0 | 浏览次数 |
| rating_avg | DECIMAL(2,1) | DEFAULT 0 | 平均评分（1-5） |
| rating_count | INTEGER | DEFAULT 0 | 评分人数 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

#### comments（评论表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| skill_id | UUID | FK → skills.id, INDEX | 所属 Skill |
| user_id | UUID | FK → users.id | 评论者 |
| content | TEXT | NOT NULL | 评论内容 |
| parent_id | UUID | FK → comments.id, NULL | 父评论 ID（NULL 表示主评论） |
| is_deleted | BOOLEAN | DEFAULT FALSE | 软删除标记 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

#### favorites（收藏表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| user_id | UUID | FK → users.id, PK | 用户 ID |
| skill_id | UUID | FK → skills.id, PK | Skill ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 收藏时间 |

#### ratings（评分表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| user_id | UUID | FK → users.id, PK | 用户 ID |
| skill_id | UUID | FK → skills.id, PK | Skill ID |
| score | SMALLINT | CHECK(1-5) | 评分 1-5 |
| created_at | TIMESTAMP | DEFAULT NOW() | 首次评分时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

#### notifications（通知表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| user_id | UUID | FK → users.id, INDEX | 接收者 |
| type | VARCHAR(50) | NOT NULL | 类型：`skill_update` |
| skill_id | UUID | FK → skills.id | 关联 Skill |
| message | VARCHAR(255) | NOT NULL | 通知内容 |
| is_read | BOOLEAN | DEFAULT FALSE | 是否已读 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

#### tags（标签表）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| name | VARCHAR(30) | UNIQUE, NOT NULL | 标签名（小写） |
| usage_count | INTEGER | DEFAULT 0 | 使用次数 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |

### 5.3 索引设计

```sql
-- Skill 查询优化
CREATE INDEX idx_skills_deleted_created ON skills(is_deleted, created_at DESC);
CREATE INDEX idx_skills_tags ON skills USING GIN(tags);
CREATE INDEX idx_skills_pinned ON skills(is_pinned DESC);

-- 评论查询
CREATE INDEX idx_comments_skill ON comments(skill_id, is_deleted, created_at);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- 通知查询
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at);

-- 全文搜索（中文）
CREATE INDEX idx_skills_fts ON skills
  USING gin(to_tsvector('chinese', name || ' ' || COALESCE(description, '')));
```

### 5.4 热度算法

```python
def calculate_hot_score(skill) -> float:
    """
    热度分 = (评分 × 20) + (下载数 × 2) + (收藏数 × 5) - (时间衰减分)
    时间衰减分 = (当前时间 - 上传时间天数) × 1
    最低热度分 = 0
    """
    rating_score = skill.rating_avg * 20  # 满分 100 分
    download_score = skill.download_count * 2
    favorite_score = skill.favorite_count * 5

    days_old = (current_time - skill.created_at).days
    time_decay = days_old * 1

    score = rating_score + download_score + favorite_score - time_decay
    return max(0, score)
```

---

## 6. 模块划分

### 6.1 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │  auth   │ │ skills  │ │comments │ │  users  │ │ admin  │ │
│  │  -登录   │ │ -CRUD   │ │ -嵌套   │ │ -个人   │ │ -置顶  │ │
│  │  -注册   │ │ -榜单   │ │ -回复   │ │ -统计   │ │ -导出  │ │
│  │  -刷新   │ │ -搜索   │ │ -删除   │ │ -通知   │ │ -标签  │ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └───┬────┘ │
└───────┼───────────┼───────────┼───────────┼──────────┼──────┘
        │           │           │           │          │
        └───────────┴─────┬─────┴───────────┘          │
                          │                            │
              ┌───────────┴───────────┐                │
              │     Service Layer      │◄───────────────┘
              │  ┌─────────────────┐   │
              │  │  SkillService   │   │
              │  │  - 创建/更新     │   │
              │  │  - 热度计算      │   │
              │  │  - 文件处理      │   │
              │  │  - 搜索过滤      │   │
              │  └─────────────────┘   │
              │  ┌─────────────────┐   │
              │  │  UserService    │   │
              │  │  - 注册/登录     │   │
              │  │  - JWT 管理      │   │
              │  │  - 统计面板      │   │
              │  └─────────────────┘   │
              │  ┌─────────────────┐   │
              │  │ CommentService  │   │
              │  │  - 发表评论      │   │
              │  │  - 嵌套回复      │   │
              │  │  - 删除评论      │   │
              │  └─────────────────┘   │
              │  ┌─────────────────┐   │
              │  │  RatingService  │   │
              │  │  - 评分/改分     │   │
              │  │  - 平均分计算    │   │
              │  └─────────────────┘   │
              │  ┌─────────────────┐   │
              │  │  FileService    │   │
              │  │  - 上传/存储     │   │
              │  │  - 读取/提供     │   │
              │  │  - 目录管理      │   │
              │  └─────────────────┘   │
              │  ┌─────────────────┐   │
              │  │ NotificationService│ │
              │  │  - 创建通知      │   │
              │  │  - 标记已读      │   │
              │  └─────────────────┘   │
              └───────────┬───────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐ ┌────────▼────────┐ ┌──────▼──────┐
│  PostgreSQL  │ │   File System   │ │    JWT      │
│  (SQLModel)  │ │   (Uploads)     │ │   (Auth)    │
└──────────────┘ └─────────────────┘ └─────────────┘
```

### 6.2 模块职责

#### Core 模块
- **config.py**: 应用配置管理（数据库 URL、JWT 密钥、文件路径等）
- **database.py**: 数据库引擎创建、会话管理、依赖注入
- **security.py**: 密码哈希、JWT 编码/解码、当前用户依赖
- **exceptions.py**: 业务异常定义和全局异常处理

#### Models 模块
- 定义 SQLModel 数据模型
- 包含表关系定义（relationship）
- 数据库级别的约束和默认值

#### Schemas 模块
- Pydantic 模型定义 API 请求/响应结构
- 与 Models 分离，避免循环依赖
- 包含嵌套 Schema（如 SkillWithAuthor）

#### API 模块
- 路由注册和端点定义
- 依赖注入（获取当前用户、数据库会话）
- 请求参数解析和响应封装
- 不涉及业务逻辑，仅做参数传递

#### Services 模块
- 纯业务逻辑实现
- 不依赖 HTTP 上下文
- 可被测试直接调用
- 事务边界控制

---

## 7. API 设计

### 7.1 认证接口 (`/api/v1/auth`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/register` | 邮箱注册 | 否 |
| POST | `/login` | 邮箱登录，设置 HttpOnly Cookie | 否 |
| POST | `/refresh` | 刷新 Access Token | 否（需 Cookie） |
| POST | `/logout` | 登出，清除 Cookie | 是 |
| GET | `/me` | 获取当前用户信息 | 是 |

### 7.2 Skill 接口 (`/api/v1/skills`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/` | Skill 列表（分页、搜索、标签、排序） | 否 |
| GET | `/trending` | 本周热门（7天增长最快） | 否 |
| GET | `/top-rated` | 评分最高（≥3人评分） | 否 |
| GET | `/most-downloaded` | 下载最多 | 否 |
| POST | `/` | 上传新 Skill | 是 |
| GET | `/{id}` | Skill 详情 | 否（增加浏览计数） |
| PUT | `/{id}` | 更新 Skill 元信息 | 是（作者） |
| DELETE | `/{id}` | 软删除 Skill | 是（作者/管理员） |
| POST | `/{id}/download` | 下载 Skill 包 | 否（增加下载计数） |
| POST | `/{id}/rate` | 评分（1-5星） | 是 |
| POST | `/{id}/favorite` | 收藏/取消收藏 | 是 |

### 7.3 评论接口 (`/api/v1/skills/{skill_id}/comments`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/` | 获取评论列表（嵌套结构） | 否 |
| POST | `/` | 发表评论 | 是 |
| DELETE | `/{comment_id}` | 删除评论 | 是（作者/管理员） |

### 7.4 用户接口 (`/api/v1/users`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/me/skills` | 我上传的 Skills | 是 |
| GET | `/me/favorites` | 我收藏的 Skills | 是 |
| GET | `/me/comments` | 我的评论 | 是 |
| GET | `/me/stats` | 作者统计面板 | 是 |
| GET | `/me/notifications` | 站内通知列表 | 是 |
| PATCH | `/notifications/{id}/read` | 标记通知已读 | 是 |

### 7.5 文件接口 (`/api/v1/files`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/{filename}` | 获取上传的文件 | 否 |

### 7.6 管理员接口 (`/api/v1/admin`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/skills/{id}/pin` | 置顶/取消置顶 | 是（管理员） |
| DELETE | `/comments/{id}` | 删除任意评论 | 是（管理员） |
| GET | `/export` | 导出 Skills CSV | 是（管理员） |
| GET | `/tags` | 标签列表管理 | 是（管理员） |
| POST | `/tags/merge` | 合并标签 | 是（管理员） |

---

## 8. 认证与授权

### 8.1 JWT 认证流程

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Client │    │ FastAPI │    │  Redis  │    │PostgreSQL│
└────┬────┘    └────┬────┘    └─────────┘    └────┬────┘
     │              │                             │
     │  1. 登录     │                             │
     │─────────────>│                             │
     │              │                             │
     │              │  2. 验证密码                 │
     │              │────────────────────────────>│
     │              │<────────────────────────────│
     │              │                             │
     │  3. 返回 Access Token + 设置 Refresh Cookie│
     │<─────────────│                             │
     │              │                             │
     │  4. 请求 API (Authorization: Bearer {token})│
     │─────────────>│                             │
     │              │  5. 验证 Token               │
     │              │                             │
     │  6. 响应     │                             │
     │<─────────────│                             │
     │              │                             │
     │  7. Token 过期，用 Refresh Cookie 请求刷新  │
     │─────────────>│                             │
     │              │  8. 验证 Refresh Token       │
     │              │                             │
     │  9. 返回新 Access Token                    │
     │<─────────────│                             │
```

### 8.2 Token 配置

| Token 类型 | 有效期 | 存储位置 | 用途 |
|------------|--------|----------|------|
| Access Token | 24 小时 | 前端内存（Authorization Header） | API 认证 |
| Refresh Token | 7 天 | HttpOnly Cookie | 刷新 Access Token |

### 8.3 权限矩阵

| 操作 | 游客 | 登录用户 | 作者 | 管理员 |
|------|------|----------|------|--------|
| 浏览 Skill | ✅ | ✅ | ✅ | ✅ |
| 下载 Skill | ✅ | ✅ | ✅ | ✅ |
| 评分/收藏 | ❌ | ✅ | ✅ | ✅ |
| 评论 | ❌ | ✅ | ✅ | ✅ |
| 上传 Skill | ❌ | ✅ | ✅ | ✅ |
| 编辑/删除 Skill | ❌ | ❌ | ✅ | ✅ |
| 删除评论 | ❌ | ❌ | 自己的 | ✅ |
| 置顶 Skill | ❌ | ❌ | ❌ | ✅ |
| 导出报表 | ❌ | ❌ | ❌ | ✅ |

---

## 9. 文件存储设计

### 9.1 存储结构

```
uploads/
└── skills/
    └── {skill_id}/              # 使用 Skill UUID 作为目录名
        ├── package.zip          # 上传的原始压缩包
        ├── extracted/           # 解压后的文件（用于预览）
        │   ├── SKILL.md
        │   ├── README.md
        │   └── scripts/
        └── images/              # 演示图片
            ├── 0.png
            ├── 1.gif
            └── 2.png
```

### 9.2 文件访问 URL

| 类型 | URL 示例 |
|------|----------|
| Skill 包下载 | `GET /api/v1/skills/{id}/download` |
| 演示图片 | `GET /api/v1/files/{skill_id}/images/0.png` |
| 解压文件预览 | `GET /api/v1/files/{skill_id}/extracted/SKILL.md` |

### 9.3 安全措施

- 禁止上传可执行文件（.exe, .dll, .so, .bat 等）
- 文件类型白名单：`.zip`, `.md`, `.txt`, `.json`, `.yaml`, `.py`, `.js`, `.ts`, `.sh`
- 单文件大小限制：50MB
- 压缩包解压深度限制：最多 3 层
- 文件名安全处理：去除路径遍历字符

---

## 10. 前端架构

### 10.1 项目结构

```
frontend/src/
├── components/
│   ├── ui/                    # shadcn/ui 组件（自动生成）
│   ├── layout/                # 布局组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── skill/                 # Skill 相关组件
│   │   ├── SkillCard.tsx
│   │   ├── SkillList.tsx
│   │   ├── SkillForm.tsx
│   │   └── FileTree.tsx
│   └── common/                # 通用组件
│       ├── MarkdownPreview.tsx
│       ├── StarRating.tsx
│       └── Pagination.tsx
├── pages/
│   ├── Home.tsx               # 首页（榜单）
│   ├── SkillDetail.tsx        # Skill 详情页
│   ├── SkillUpload.tsx        # 上传/编辑页
│   ├── UserProfile.tsx        # 个人中心
│   ├── Login.tsx              # 登录页
│   └── Register.tsx           # 注册页
├── hooks/
│   ├── useAuth.ts             # 认证状态管理
│   ├── useSkills.ts           # Skill 数据获取
│   └── useApi.ts              # API 请求封装
├── lib/
│   ├── api.ts                 # axios 实例和请求方法
│   ├── utils.ts               # 工具函数
│   └── constants.ts           # 常量定义
├── types/
│   ├── user.ts                # 用户相关类型
│   ├── skill.ts               # Skill 相关类型
│   └── index.ts               # 类型导出
├── App.tsx                    # 根组件
└── main.tsx                   # 入口文件
```

### 10.2 状态管理

- **服务端状态**：React Query（缓存、刷新、分页）
- **客户端状态**：React Context（认证状态）
- **表单状态**：React Hook Form（上传/编辑表单）

### 10.3 路由设计

| 路径 | 页面 | 认证要求 |
|------|------|----------|
| `/` | 首页（榜单） | 否 |
| `/skills/:id` | Skill 详情 | 否 |
| `/upload` | 上传 Skill | 是 |
| `/skills/:id/edit` | 编辑 Skill | 是（作者） |
| `/login` | 登录 | 否 |
| `/register` | 注册 | 否 |
| `/profile` | 个人中心 | 是 |
| `/profile/skills` | 我的 Skills | 是 |
| `/profile/favorites` | 我的收藏 | 是 |

---

## 11. 安全设计

### 11.1 认证安全

- 密码使用 bcrypt 加密存储（salt rounds = 12）
- JWT 使用 HS256 算法，密钥从环境变量读取
- Refresh Token 存储在 HttpOnly Cookie 中，防止 XSS
- Access Token 前端内存存储，定期刷新

### 11.2 输入安全

- 所有用户输入使用 Pydantic 校验
- SQL 注入防护：使用 SQLModel/SQLAlchemy ORM，禁止原生 SQL
- XSS 防护：文本输出时 HTML 转义
- 文件上传：白名单校验、大小限制、路径安全处理

### 11.3 访问控制

- 基于角色的权限检查（依赖注入）
- 资源级权限验证（作者身份检查）
- CORS 配置：仅允许开发环境 localhost 访问

---

## 12. 性能考虑

### 12.1 当前阶段（无缓存）

- 50 人规模，纯数据库查询完全够用
- 首页列表分页，每页 20 条
- Skill 详情页单次查询（使用 SQLModel 的 selectinload 减少 N+1）

### 12.2 未来可扩展

- 热度榜单可添加 Redis 缓存（定时任务更新）
- 文件存储可迁移到对象存储（OSS/S3）
- 静态资源可添加 CDN

---

## 13. 开发规范

### 13.1 后端规范

- 类型标注：全部函数必须显式标注类型
- 异步：数据库操作全部使用 async/await
- 错误处理：使用自定义异常 + 全局异常处理器
- 代码质量：`ruff check` 和 `mypy app` 无错误

### 13.2 前端规范

- 类型优先：禁止 `any`，全部接口定义类型
- 组件：函数组件 + Hooks，避免类组件
- 样式：使用 Tailwind CSS，禁止硬编码颜色（使用 shadcn 变量）
- 代码质量：`npm run lint` 和 `npm run type-check` 无错误

### 13.3 Git 提交规范

```
<type>(<scope>): <subject>

类型：feat(新功能)、fix(修复)、docs(文档)、refactor(重构)、test(测试)、chore(构建)
示例：feat(skills): 添加 Skill 上传功能
```

---

## 14. 环境变量配置

### 14.1 后端 `.env.backend`

```bash
# 数据库
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/openclaw

# JWT
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24小时
REFRESH_TOKEN_EXPIRE_DAYS=7

# 文件存储
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800  # 50MB

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# 环境
ENVIRONMENT=development  # development/production
```

### 14.2 前端 `.env.frontend`

```bash
# API 地址
VITE_API_BASE_URL=http://localhost:8000/api/v1

# 文件服务地址
VITE_FILE_BASE_URL=http://localhost:8000/api/v1/files
```

---

## 15. 后续演进建议

### 15.1 短期（验证阶段后）

1. 添加 Redis 缓存热门榜单
2. 文件存储迁移到对象存储（MinIO/阿里云 OSS）
3. 添加 Celery 处理异步任务（文件解压、缩略图生成）

### 15.2 中期（用户增长后）

1. 全文搜索优化（Elasticsearch/Meilisearch）
2. 图片 CDN 加速
3. 数据库读写分离

### 15.3 长期

1. 微服务拆分（Skill 服务、用户服务、通知服务）
2. 容器化部署（K8s）
3. 多语言支持

---

## 16. 参考文档

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [SQLModel 官方文档](https://sqlmodel.tiangolo.com/)
- [React 官方文档](https://react.dev/)
- [shadcn/ui 文档](https://ui.shadcn.com/)

---

*本文档基于 PRD.md 制定，用于指导 OpenClaw Skills Hub 的开发实现。*
