# OpenClaw Skills Hub - 项目进度文档

> 本文档记录 OpenClaw Skills Hub 的完整施工计划与当前进度
> 最后更新：2026-03-20（M6.8 个人中心开发验收通过）
> **当前状态：F1-F5 前端视觉重构已完成，后端 219 测试通过，M6.6/M6.7/M6.8 完成**

---

**📍 当前聚焦 (Current Focus):**
- **M6.9: 管理员后台** - 管理员专属后台页面（Dashboard / Skill 管理 / 用户管理 / 评论管理 / 数据统计）

---

## 总览进度表

| 模块 | 子任务数 | 进度 | 状态 | 阻塞项 |
|------|---------|------|------|--------|
| M1: 基础设施 | 5 | 100% | 🟢 已完成 | - |
| M2: 用户认证 | 6 | 100% | 🟢 已完成 | - |
| M3: Skill 核心 | 8 | 100% | 🟢 已完成 | - |
| M4: 互动功能 | 4 | 100% | 🟢 已完成 | - |
| M5: 管理后台基础 | 4 | 100% | 🟢 已完成 | - |
| M5.5: 后端接口补充 | 4 | 100% | 🟢 已完成 | - |
| M5.6: 管理员功能扩展 | 6 | 100% | 🟢 已完成 | - |
| **F: 前端视觉重构** | **20** | **100%** | 🟢 **已完成** | **F1-F5 完成，F6 跳过** |
| M6: 前端页面功能 | 10 | 90% | 🟡 进行中 | **M6.9 待开发** |
| M7: 部署上线 | 3 | 0% | 🔴 未开始 | M6 |
| M8: 后续功能（Post-MVP） | 10 | 0% | 🔴 未开始 | M7 |

**图例**：🔴 未开始 / 🟡 进行中 / 🟢 已完成 / ⚪ 阻塞

---

## 已完成工作总结

### M1: 基础设施 ✅ (100%)
- 后端：Python 3.11 + FastAPI + SQLModel + PostgreSQL
- 前端：Vite + React 18 + TypeScript 5 + Tailwind CSS
- 代码质量：Ruff + MyPy

### M2: 用户认证 ✅ (100%)
- `schemas/user.py` - UserCreate, UserLogin, UserResponse, TokenResponse
- `services/user_service.py` - 注册/登录/获取用户服务
- `api/deps.py` - get_current_user, get_current_admin 依赖注入
- `api/v1/auth.py` - 认证路由 (注册/登录/刷新/登出/获取当前用户)
- JWT Token 认证 + Refresh Token Cookie
- bcrypt 密码加密
- **测试覆盖**：单元测试 17 个 + 集成测试 14 个，代码覆盖率 90%

### M3: Skill 核心 ✅ (100%)
- 数据模型：skill, tag, favorite, rating
- `services/skill_service.py` - Skill CRUD + 热度计算 + 搜索
- `services/rating_service.py` - 评分服务（首次评分/更新评分/统计）
- `services/favorite_service.py` - 收藏服务
- `api/v1/skills.py` - 完整 API 路由
- **测试覆盖**：单元测试 63 个 + 集成测试 31 个，108 tests passed

### M4: 互动功能 ✅ (100%)
- `models/comment.py` - 评论模型（支持嵌套回复）
- `services/comment_service.py` - 评论服务
- `services/notification_service.py` - 通知服务
- `api/v1/comments.py` - 评论 API 路由
- `api/v1/notifications.py` - 通知 API 路由
- **测试覆盖**：单元测试 79 个 + 集成测试 40 个，141 tests passed

### M5: 管理后台基础 ✅ (100%)
- `api/v1/admin.py` - 基础管理后台路由
- `CurrentAdmin` 依赖注入
- 置顶/取消置顶、删除评论、导出 Skills CSV、标签合并
- **测试覆盖**：集成测试 12 个，153 tests passed

### M5.5: 后端接口补充 ✅ (100%)
- `GET /api/v1/users/me/stats` - 用户统计接口
- `GET /api/v1/tags` - 公开标签列表
- 修复 `author_username` 字段返回
- 评论返回新增 `username` 字段
- **测试覆盖**：新增 15 个测试，总计 168 个测试通过

### M5.6: 管理员功能扩展 ✅ (100%)
> **来源**：PRD v1.2 新增需求

**数据库模型更新：**
- `users` 表添加 `is_active` 字段（账号启用/禁用）
- 新建 `download_logs` 表（记录下载用户）

**新增 AdminService 服务层：**
- `services/admin_service.py` - 封装所有管理员业务逻辑
- Skill 管理：编辑、强制删除、软删除列表、恢复、查看下载用户
- 用户管理：列表、搜索、设置管理员、启用/禁用账号
- 评论管理：列表、筛选
- 数据统计：平台概览、活跃用户榜、导出 CSV

**新增 Admin API 路由：**
- `PUT /admin/skills/{id}` - 编辑任意 Skill
- `DELETE /admin/skills/{id}` - 强制删除 Skill
- `GET /admin/skills/deleted` - 软删除列表
- `POST /admin/skills/{id}/restore` - 恢复软删除
- `GET /admin/skills/{id}/downloads` - 查看下载用户
- `GET /admin/users` - 用户列表（分页/搜索）
- `PATCH /admin/users/{id}/admin` - 设置管理员权限
- `PATCH /admin/users/{id}/status` - 启用/禁用账号
- `GET /admin/comments` - 评论列表（筛选/分页）
- `GET /admin/stats/overview` - 平台概览统计
- `GET /admin/stats/active-users` - 活跃用户榜单
- `GET /admin/export/users` - 导出用户 CSV
- `GET /admin/export/tags` - 导出标签 CSV

**用户禁用功能：**
- `api/deps.py` - `get_current_user` 检查禁用状态
- `api/v1/auth.py` - 登录时检查禁用状态，返回 403

**测试覆盖：**
- 单元测试：新增 `test_admin_service.py` 17 个测试
- 集成测试：新增 16 个 admin API 测试 + 1 个禁用用户测试
- **总计 202 个测试全部通过**

### F5: Skill 详情页重构 ✅ (100%)
> **日期**：2026-03-19

**信息展示区重构：**
- `src/pages/SkillDetail.tsx` - 头部信息玻璃拟态卡片（emoji图标 + 渐变标题 + 作者头像徽章）
- 内容分区各自独立玻璃拟态卡片（简介/使用场景/使用方法/文件结构/标签/评论）
- 渐变标题效果（`var(--btn-gradient)` + backgroundClip: text）
- 错误状态玻璃拟态卡片 + 渐变按钮返回首页

**交互区重构：**
- 玻璃拟态评分组件（StarRating.tsx：CSS变量颜色 + hover缩放动效）
- 渐变下载按钮（`var(--btn-gradient)` + hover:scale-105 + 阴影）
- 收藏按钮主题适配（收藏/未收藏状态使用CSS变量，红色收藏态）
- 统计信息玻璃拟态小卡片（浏览/下载/收藏 渐变数值展示）
- 作者编辑/删除按钮使用CSS变量（蓝色编辑/红色删除）

**评论区重构：**
- `src/components/common/CommentSection.tsx` - CSS变量全替换
- 嵌套回复视觉层次（`borderLeft: var(--card-border)` 缩进线）
- 评论输入框焦点蓝环效果（`0 0 0 3px rgba(59,130,246,0.15)`）
- 空状态图标提示 + 未登录提示条（虚线边框玻璃背景）
- 评论头像渐变徽章（`var(--btn-gradient)`）

**文件树重构：**
- `src/components/skill/FileTree.tsx` - 图标颜色改用CSS变量
- 文件夹图标（`var(--accent-primary/secondary)`）/ 文件图标（`var(--text-tertiary)`）
- hover平移动效（translateX(4px)）+ 颜色高亮

**修改文件：**
- `src/pages/SkillDetail.tsx` - 完全重构（550+行）
- `src/components/common/StarRating.tsx` - 适配CSS变量
- `src/components/common/CommentSection.tsx` - 完全重构玻璃拟态评论系统
- `src/components/skill/FileTree.tsx` - 适配CSS变量

**验收截图：**
- `f5-skill-detail-light.png` - 亮色主题效果
- `f5-skill-detail-dark-top.png` - 暗色主题顶部
- `f5-skill-detail-dark-bottom.png` - 暗色主题底部（文件树/标签/评论区）

### F1: 全局样式与主题系统 ✅ (100%)
> **日期**：2026-03-19

**CSS 变量系统：**
- `src/index.css` - 白天/夜间双主题 CSS 变量定义
- 渐变背景：`--bg-primary`（深海蓝晶 → 午夜深蓝）
- 玻璃拟态：`--card-bg`, `--card-border`, `--card-shadow`
- 强调色：`--accent-primary` (#3b82f6), `--accent-secondary` (#06b6d4)
- 按钮渐变：`--btn-gradient`, `--stat-gradient`

**背景光晕动画：**
- `@keyframes bgPulse` - 12s 循环光晕浮动动画
- `body::before/::after` - 双光晕伪元素（蓝 + 青）
- `filter: blur(120px)` - 大范围柔化光晕效果

**主题系统：**
- `src/components/layout/ThemeContext.ts` - ThemeContext 定义
- `src/components/layout/ThemeProvider.tsx` - 主题上下文组件
- `src/hooks/useTheme.ts` - useTheme Hook
- localStorage 持久化 + 系统主题偏好检测
- `data-theme` 属性控制，0.5s 平滑过渡

**Tailwind 扩展：**
- `tailwind.config.js` - 添加 glass、gradient、font-family 扩展
- 工具类：`.glass`, `.glass-navbar`, `.gradient-text`, `.btn-gradient`, `.card-hover`

**字体加载：**
- `index.html` - Google Fonts（Space Grotesk + Noto Sans SC + Inter）
- `font-family: heading/body` - Tailwind 字体配置


### F2: 布局组件重构 ✅ (100%)
> **日期**：2026-03-19
- **Header 完全重构**：玻璃拟态导航栏（`backdrop-filter: blur(20px)`）、渐变 Logo（`background: var(--btn-gradient)` + `backgroundClip: text`）、主题切换按钮（太阳/月亮图标 + 旋转动画）、玻璃拟态用户下拉菜单（含管理员入口）、渐变注册按钮
- **Footer 重构**：玻璃拟态背景、渐变分隔线（`linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%)`）、渐变品牌 Logo
- **Sidebar 重构**：玻璃拟态卡片、标签按使用频率动态调整字号（0.75rem - 1.1rem）、选中态渐变高亮、移动端抽屉玻璃效果 + 浮动筛选按钮
- **Layout 重构**：背景双光晕动画（蓝 + 青，12s 循环，animation-delay 交错）、统一渐变背景层（`var(--bg-primary)`）
- **App.tsx 路由架构重构**：所有主路由通过 Layout 的 Outlet 渲染，Login/Register 作为独立路由
- **Home.tsx 同步更新**：应用玻璃拟态搜索框、Tab、SkillCard 样式

**修改文件：**
- `src/components/layout/Header.tsx` - 完全重构
- `src/components/layout/Footer.tsx` - 完全重构
- `src/components/layout/Sidebar.tsx` - 完全重构
- `src/components/layout/Layout.tsx` - 添加背景光晕
- `src/App.tsx` - 重构路由架构
- `src/pages/Home.tsx` - 同步应用玻璃拟态样式
---

### M6.6: Skill 上传页 ✅ (100%)
> **日期**：2026-03-20（开发）/ 2026-03-20（Playwright 验收通过）

**功能实现：**
- `src/pages/SkillUpload.tsx` - 三步式上传流程（600+ 行）
  - Step 1：拖拽/点击上传区域（.zip / .md，最大 50MB），上传进度条
  - Step 2：玻璃拟态表单（名称 / 简短描述字数计数 / 使用场景 Markdown / 使用方法 Markdown / 标签）
  - Step 3：预览确认卡片（展示 Skill 元信息 + 文件信息）

**依赖库：**
- `react-simplemde-editor` + `easymde` - Markdown 编辑器
- SimpleMDE CSS 主题已在 `src/index.css` 中适配玻璃拟态风格

**API 集成：**
- `POST /api/v1/skills`（multipart/form-data，flat form fields）→ 创建 Skill，获取 ID
- `PUT /api/v1/skills/{id}`（JSON）→ 保存完整元数据
- 提交成功后跳转 `/skills/{id}` 详情页

**后端修复（同期）：**
- `app/api/v1/skills.py` - `create_skill` 端点改为接受独立 Form 字段（修复 422）
- `app/services/skill_service.py` - `update_skill` datetime 修复（修复 500）
- `app/models/*.py`（8 个文件）- 所有 datetime 改为 timezone-naive（修复登录 500）
- `app/hooks/useAuth.ts` - `isLoading` 初始值修复（修复 PrivateRoute 竞态）

**Playwright 验收结果（2026-03-20）：**
- [x] 三步骤正常切换，步骤指示器状态（渐变激活/✓完成/灰色未到）
- [x] 拖拽上传区域：虚线边框，未选文件+点击"下一步"时边框变红 + 错误提示
- [x] 非法文件类型（.txt）触发 alert "请上传 .zip 或 .md 文件"
- [x] 描述字数实时计数（"N / 10-50 字"，不足时红色，达标后正常色）
- [x] 提交成功跳转新 Skill 详情页 `/skills/{uuid}`
- [x] 亮色/暗色双主题视觉验收通过（Playwright 截图存档）
- [x] `npm run lint && npm run type-check` 无错误

---

### M6.8: 个人中心 ✅ (100%)
> **日期**：2026-03-20

**后端补充（TDD 驱动，16 测试全通过）：**
- `GET /api/v1/users/me/skills` - 分页返回当前用户上传的 Skills（按创建时间倒序）
- `GET /api/v1/users/me/favorites` - 分页返回当前用户收藏的 Skills（含 author_username，按收藏时间倒序）
- `GET /api/v1/users/me/comments` - 分页返回当前用户评论（含 skill_name 字段，JOIN Skill 表）
- `GET /api/v1/users/me/stats` - 修复为真实 DB 查询（总浏览/下载/收藏/评分分布/7天30天趋势）
- TDD 集成测试：`test_user_profile_api.py` 16 个用例（401 拦截 / 分页结构 / 数据隔离 / 字段校验）
- **总计 219 个测试全部通过**

**前端实现：**
- `src/pages/UserProfile.tsx` - 嵌套布局（用户信息卡 + Tab 导航 + 右侧统计面板），`<Outlet>` 渲染子路由
  - 用户信息卡：渐变头像徽章 + 用户名/邮箱/快速 badges（加入时间/作品数/收藏数）
  - 右侧统计面板：4 个数值卡片 + SVG 评分分布柱状图 + SVG 浏览趋势折线图（7天/30天切换）
  - 骨架屏加载态（玻璃拟态 animate-pulse）
- `src/pages/UserSkills.tsx` - 我的 Skills 网格（hover 显示编辑/删除按钮，内联确认弹窗）
- `src/pages/UserFavorites.tsx` - 我的收藏网格（hover 显示取消收藏按钮，POST toggle）
- `src/pages/UserComments.tsx` - 我的评论列表（Skill 名可点击跳转，内联删除确认弹窗）
- `src/App.tsx` - `/profile` 改为嵌套路由，index 自动重定向到 `/profile/skills`
- `src/types/index.ts` - 新增 `MySkillItem`、`MyCommentItem`、`PagedResponse<T>`、`UserStats` 类型

**Playwright 验收结果（2026-03-20）：**
- [x] `/profile` 自动重定向到 `/profile/skills`
- [x] 用户信息卡正确显示 username / email / 统计 badges
- [x] Tab 切换：「我的收藏」跳转 `/profile/favorites`，「我的评论」跳转 `/profile/comments`
- [x] 右侧统计面板：4 个数值卡片可见（浏览量/下载量/收藏数/作品数）
- [x] 评分分布柱状图与趋势折线图可见（SVG 渲染）
- [x] 空状态提示正常（无收藏/无评论时显示引导按钮）
- [x] 亮色/暗色双主题视觉验收通过（Playwright 截图存档）
- [x] `npm run lint:fix && npm run type-check` 无错误

---


## 视觉驱动开发 + 增量验收流程

> **开发模式说明**：采用"重构一个页面 → 验收一个页面 → 确认后再继续"的方式，确保每一步都符合 design-system 规范。

### 验收标准通用定义

| # | 验收项 | 验收方法 | 通过标准 |
|---|--------|----------|----------|
| 1 | 玻璃拟态效果 | 视觉检查 | 卡片半透明 + backdrop-blur 效果 |
| 2 | 渐变背景 | 视觉检查 | 页面有柔和渐变 + 动态光晕动画 |
| 3 | 双主题切换 | 操作测试 | 点击主题按钮，0.5s 平滑切换到夜间模式 |
| 4 | 字体加载 | 视觉检查 | Space Grotesk + Noto Sans SC 正确显示 |
| 5 | 悬浮动效 | 交互测试 | 卡片悬浮时 translateY(-6px) + 阴影增强 |
| 6 | 响应式布局 | 浏览器测试 | 375px/768px/1920px 三个断点正常 |
| 7 | 代码质量 | 命令检查 | `npm run lint && npm run type-check` 无错误 |

---

## F: 前端视觉重构 🟡 (45%)

> **目标**：按照 design-system.md 完全重构前端，实现玻璃拟态 + 双主题设计

### F1: 全局样式与主题系统

- [x] **F1.1** CSS 变量定义 (`src/index.css`)
  - [x] 白天主题 `:root` 变量（背景、卡片、文字、强调色）
  - [x] 夜间主题 `[data-theme="dark"]` 变量
  - [x] 背景光晕动画 `@keyframes bgPulse` (12s 循环)
  - [x] 字体加载（Google Fonts：Space Grotesk + Noto Sans SC + Inter）

- [x] **F1.2** Tailwind 主题扩展 (`tailwind.config.js`)
  - [x] 添加 glass 工具类（背景、边框、阴影）
  - [x] 添加渐变工具类
  - [x] 扩展颜色映射到 CSS 变量

- [x] **F1.3** 主题上下文组件 (`src/components/layout/ThemeProvider.tsx`)
  - [x] ThemeContext 定义
  - [x] localStorage 持久化主题偏好
  - [x] 系统主题偏好检测

- [x] **F1.4** 主题初始化 (`src/main.tsx`)
  - [x] 包裹 ThemeProvider
  - [x] 页面加载时读取保存的主题

**验收标准：**
- [x] 页面加载显示渐变背景 + 光晕动画
- [x] localStorage 能记住主题选择
- [x] 刷新页面主题不丢失
- [x] `npm run type-check` 无错误

**阻塞项：** 完成后方可进入 F2

---

### F2: 布局组件重构 ✅ (100%)

- [x] **F2.1** Header 重构 (`src/components/layout/Header.tsx`)
  - [x] 玻璃拟态导航栏（backdrop-blur + 半透明背景）
  - [x] 渐变 Logo 文字效果
  - [x] 主题切换按钮（太阳/月亮图标 + 旋转动画）
  - [x] 用户菜单玻璃拟态下拉

- [x] **F2.2** Footer 重构 (`src/components/layout/Footer.tsx`)
  - [x] 玻璃拟态背景
  - [x] 渐变分隔线

- [x] **F2.3** Sidebar 重构 (`src/components/layout/Sidebar.tsx`)
  - [x] 玻璃拟态卡片
  - [x] 标签云使用频率调整大小

- [x] **F2.4** Layout 重构 (`src/components/layout/Layout.tsx`)
  - [x] 添加背景光晕元素
  - [x] 统一玻璃拟态容器

**验收标准：**
- [x] 导航栏玻璃拟态效果可见
- [x] 点击主题按钮切换白天/夜间模式
- [x] 移动端导航栏适配正常
- [x] 验收员截图确认效果

**阻塞项：** 完成后方可进入 F3

---

### F3: 认证页面重构 ✅ (100%)
> **日期**：2026-03-19

- [x] **F3.1** Login 页重构 (`src/pages/Login.tsx`)
  - [x] 玻璃拟态登录卡片（backdrop-blur + 半透明背景）
  - [x] 渐变背景下的表单布局（复用 body CSS 变量）
  - [x] 输入框玻璃拟态样式 + 焦点蓝色光环
  - [x] 渐变主按钮（悬浮放大效果）
  - [x] 右上角主题切换按钮

- [x] **F3.2** Register 页重构 (`src/pages/Register.tsx`)
  - [x] 玻璃拟态注册卡片
  - [x] 密码强度指示器（弱=红渐变/中=黄/强=蓝青渐变主题色）

**验收标准：**
- [x] 登录页显示渐变背景 + 玻璃卡片
- [x] 表单输入有焦点光环效果
- [x] 按钮悬浮有放大 + 阴影效果
- [x] 夜间模式切换后表单可读
- [x] 验收员截图确认效果（Playwright 截图通过）
- [x] 移动端 375px 响应式正常

**阻塞项：** 完成后方可进入 F4

---

### F4: 首页重构 ✅ (100%)
> **日期**：2026-03-19

- [x] **F4.1** Hero 区域 (`src/pages/Home.tsx`)
  - [x] 渐变 Slogan 文字效果（"中建"蓝青渐变高亮）
  - [x] SVG 环形进度统计卡片（AI Skills / 总下载 / 活跃用户）
  - [x] 玻璃拟态搜索框（带搜索按钮）

- [x] **F4.2** Tab 切换
  - [x] 全宽玻璃拟态 Tab 容器
  - [x] 激活状态高亮 + 移动端横向滚动

- [x] **F4.3** Skill 卡片网格
  - [x] SkillCard 玻璃拟态（含作者头像徽章）
  - [x] 卡片悬浮动效（translateY(-6px) + 阴影）
  - [x] 按 skill.id 哈希分配多样 emoji 图标
  - [x] SkillList 视图切换按钮换用 CSS 变量

**验收标准：**
- [x] Hero 区域有环形进度统计
- [x] 搜索框玻璃拟态效果
- [x] Skill 卡片悬浮有动效
- [x] Tab 切换视觉正常
- [x] 夜间模式正确渲染
- [x] 移动端 375px 响应式正常
- [x] Playwright 截图确认效果

**阻塞项：** 完成后方可进入 F5

---

### F5: Skill 详情页重构 ✅ (100%)
> **日期**：2026-03-19

- [x] **F5.1** 信息展示区 (`src/pages/SkillDetail.tsx`)
  - [x] 玻璃拟态主卡片（头部信息卡：emoji图标 + 渐变标题 + 作者头像徽章）
  - [x] 渐变标题效果（`var(--btn-gradient)` + backgroundClip: text）
  - [x] 文件树玻璃拟态样式（FileTree.tsx：CSS变量颜色 + hover平移动效）
  - [x] 内容分区各自独立玻璃拟态卡片（简介/使用场景/使用方法/文件结构/标签/评论）

- [x] **F5.2** 交互区
  - [x] 玻璃拟态评分组件（StarRating.tsx：CSS变量颜色 + hover缩放）
  - [x] 渐变下载按钮（`var(--btn-gradient)` + hover:scale-105 + 阴影）
  - [x] 收藏按钮主题适配（收藏/未收藏状态使用CSS变量）
  - [x] 统计信息玻璃拟态小卡片（浏览/下载/收藏 渐变数值）
  - [x] 作者编辑/删除按钮使用CSS变量

- [x] **F5.3** 评论区
  - [x] 玻璃拟态评论卡片（CommentSection.tsx：CSS变量全替换）
  - [x] 嵌套回复视觉层次（`borderLeft: var(--card-border)` 缩进线）
  - [x] 评论输入框焦点蓝环效果
  - [x] 空状态图标提示 + 未登录提示条

**验收标准：**
- [x] 详情页整体玻璃拟态风格
- [x] 按钮渐变效果正确
- [x] 评论区层次清晰
- [x] 夜间模式可读性良好
- [x] Playwright 截图确认效果（亮色/暗色双截图）
- [x] `npm run lint && npm run type-check` 无错误

**阻塞项：** 完成后方可进入 F6

---

### F6: shadcn/ui 组件样式调整 ⏭️ 已跳过

> **决定**：跳过此阶段。F1-F5 已通过直接在页面组件使用 CSS 变量实现玻璃拟态效果，shadcn/ui 基础组件的样式修改与自定义 CSS 变量体系存在潜在冲突，且 F1-F5 的方案已满足设计需求。

~~- [ ] **F6.1** Button 组件 (`src/components/ui/button.tsx`)~~
~~- [ ] **F6.2** Card 组件 (`src/components/ui/card.tsx`)~~
~~- [ ] **F6.3** Input 组件 (`src/components/ui/input.tsx`)~~

**决策理由：**
1. F1-F5 玻璃拟态效果已稳定实现，无需底层组件改动
2. shadcn/ui 组件使用自有 CSS 变量体系，修改会引入维护成本
3. 页面级定制通过 `className` 覆盖 Tailwind 工具类更灵活

---

## M6: 前端页面功能 🟡 (90%)

> **依赖**：F 前端视觉重构完成后继续
> **开发模式**：视觉驱动 + 增量验收（每页完成即验收）

**说明**：原 M6.1-M6.5 功能已完成，但样式需随 F 重构同步更新。以下为新功能开发任务。

---

### M6.6: Skill 上传页 ✅

> **目标**：分步表单上传 Skill，保持玻璃拟态设计风格

- [x] **M6.6.1** 页面框架 (`src/pages/SkillUpload.tsx`)
  - [x] 玻璃拟态步骤条（Step 1/2/3）
  - [x] 分步内容切换动画

- [x] **M6.6.2** Step 1 - 文件上传
  - [x] 拖拽上传区域（渐变边框 + 玻璃背景）
  - [x] 文件类型校验（.zip / .md）
  - [x] 上传进度条（渐变填充）

- [x] **M6.6.3** Step 2 - 填写信息
  - [x] 玻璃拟态表单卡片
  - [x] 标签输入（逗号/回车添加，最多10个）
  - [x] 描述字数限制（10-50 字）实时提示
  - [x] Markdown 编辑器（详细介绍 + 使用方法）

- [x] **M6.6.4** Step 3 - 预览确认
  - [x] Skill 预览卡片（玻璃拟态）
  - [x] 提交按钮

- [x] **M6.6.5** API 集成
  - [x] POST /skills 上传文件
  - [x] PUT /skills/:id 保存元数据
  - [x] 成功后跳转详情页

> **技术实现**：react-simplemde-editor + easymde，SimpleMDE CSS 主题适配（glassmorphism 风格）

**验收标准：**
- [x] 三步骤可正常切换
- [x] 拖拽上传区域有渐变边框效果（虚线边框 + 错误态变红）
- [x] 非法文件类型阻止并提示（alert "请上传 .zip 或 .md 文件"）
- [x] 描述字数实时计数（"10 / 10-50 字"，不足时红色提示）
- [x] 提交成功跳转新 Skill 详情页
- [x] **视觉验收**：亮色/暗色双主题截图确认符合 design-system（2026-03-20）

**阻塞项：** 依赖 F 重构完成

---

### M6.7: Skill 编辑页 ✅ (100%)

> **目标**：编辑现有 Skill，复用上传页组件
> **日期**：2026-03-20

- [x] **M6.7.1** 页面框架 (`src/pages/SkillEdit.tsx`)
  - [x] 单页表单设计（区别于上传页的三步骤）
  - [x] 加载现有数据填充表单（`useQuery` 获取 Skill 详情）
  - [x] 权限检查（`useEffect` 对比 `user.id === skill.author_id`，非作者重定向首页）
  - [x] 加载骨架屏（玻璃拟态效果）
  - [x] 加载错误状态处理

- [x] **M6.7.2** 编辑功能
  - [x] 表单字段：名称 / 简短描述（字数计数）/ 详细介绍（Markdown）/ 使用方法（Markdown）/ 标签
  - [x] 可重新上传文件（折叠面板设计，可选操作）
  - [x] 保存后显示玻璃拟态 Toast（顶部滑入，绿色成功样式）
  - [x] 保存成功后跳转回详情页

**实现文件：**
- `src/pages/SkillEdit.tsx` (600+ 行)
- `src/App.tsx` - 注册 `/skills/:id/edit` 路由

**Playwright 验收结果（2026-03-20）：**
- [x] 编辑页正确加载现有数据（Skill 名称/描述/Markdown 内容/标签均预填充正确）
- [x] 非作者访问被重定向（未登录用户重定向到登录态，非作者重定向到首页）
- [x] 修改 Skill 名称并保存成功（"验收测试Skill" → "验收测试Skill - M6.7已编辑"）
- [x] 保存后跳转回详情页并显示更新后的数据
- [x] 重新上传文件区域可折叠展开
- [x] **视觉验收**：玻璃拟态表单卡片 + 渐变按钮 + Toast 提示符合 design-system
- [x] `npm run lint && npm run type-check` 无错误

**阻塞项：** 依赖 M6.6 完成

**阻塞项：** 依赖 M6.6 完成

---

### M6.8: 个人中心 ✅ (100%)

> **目标**：用户个人中心，展示 Skills/收藏/评论/统计
> **日期**：2026-03-20

- [x] **M6.8.1** 主页面框架 (`src/pages/UserProfile.tsx`)
  - [x] 玻璃拟态用户信息卡片
  - [x] 导航标签切换（我的 Skills / 收藏 / 评论）

- [x] **M6.8.2** 作者统计面板
  - [x] PV/UV 访问量展示
  - [x] 下载/收藏总数（数值卡片）
  - [x] 评分分布图表（SVG 柱状图，玻璃拟态）
  - [x] 7天/30天趋势图（SVG 折线图，玻璃拟态）

- [x] **M6.8.3** 我的 Skills (`src/pages/UserSkills.tsx`)
  - [x] Skill 列表（带编辑/删除按钮）
  - [x] 删除确认对话框（玻璃拟态内联弹窗）
  - [x] 空状态提示

- [x] **M6.8.4** 我的收藏 (`src/pages/UserFavorites.tsx`)
  - [x] 收藏的 Skill 列表
  - [x] 取消收藏按钮

- [x] **M6.8.5** 我的评论 (`src/pages/UserComments.tsx`)
  - [x] 评论列表（玻璃拟态卡片）
  - [x] 点击跳转对应 Skill
  - [x] 删除评论按钮

**验收标准：**
- [x] 用户信息正确展示
- [x] 导航标签切换正确
- [x] 图表正确渲染
- [x] 我的 Skills 列表可操作
- [x] 删除操作有确认对话框
- [x] **视觉验收**：截图确认符合 design-system（亮/暗双主题，2026-03-20）

**阻塞项：** 依赖 M6.7 完成

---

### M6.9: 管理员后台页面 🔴

> **目标**：管理员专属后台（Dashboard + 管理功能）

- [ ] **M6.9.1** Admin Dashboard (`src/pages/admin/AdminDashboard.tsx`)
  - [ ] 平台数据统计卡片（玻璃拟态）
  - [ ] 总 Skills/用户数/今日下载/评论/上传

- [ ] **M6.9.2** Skill 管理 (`src/pages/admin/AdminSkills.tsx`)
  - [ ] Skill 列表（置顶/编辑/删除/恢复）
  - [ ] 软删除 Skill 标签页
  - [ ] 查看下载用户弹窗（玻璃拟态）

- [ ] **M6.9.3** 用户管理 (`src/pages/admin/AdminUsers.tsx`)
  - [ ] 用户列表（搜索/分页）
  - [ ] 设置管理员开关
  - [ ] 启用/禁用账号按钮

- [ ] **M6.9.4** 评论管理 (`src/pages/admin/AdminComments.tsx`)
  - [ ] 评论列表（筛选/分页）
  - [ ] 删除评论按钮

- [ ] **M6.9.5** 数据统计 (`src/pages/admin/AdminStats.tsx`)
  - [ ] 活跃用户榜单
  - [ ] 导出报表按钮

- [ ] **M6.9.6** 管理员路由保护
  - [ ] `/admin/*` 路由配置
  - [ ] AdminRoute 守卫（仅管理员可访问）

**验收标准：**
- [ ] 管理员可查看所有用户列表
- [ ] 可设置/取消管理员权限
- [ ] 可禁用/启用用户账号
- [ ] 可强制删除任意 Skill
- [ ] 可查看 Skill 下载用户列表
- [ ] 可导出各类报表
- [ ] **视觉验收**：截图确认符合 design-system

**阻塞项：** 依赖 M6.8 完成

---

### M7: 部署上线 🔴 (0%)

**目标**：项目部署与上线准备

- [ ] **M7.1** 生产环境配置
  - [ ] 环境变量配置（生产环境）
  - [ ] CORS 配置更新
  - [ ] 日志配置

- [ ] **M7.2** 部署脚本
  - [ ] 后端部署脚本
  - [ ] 前端构建脚本
  - [ ] 数据库迁移脚本

- [ ] **M7.3** 上线检查清单
  - [ ] 后端代码质量检查（ruff + mypy）
  - [ ] 前端代码质量检查（lint + type-check）
  - [ ] 数据库备份策略
  - [ ] 文件存储备份

**验收标准：**
- [ ] 生产环境可正常访问
- [ ] 数据库定期备份
- [ ] 代码质量检查无错误

---

### M8: 后续功能（Post-MVP）🔴 (0%)

> **来源**：PRD v1.2 第 8 章后续功能规划

**目标**：MVP 完成后的增强功能

| 功能 | 说明 | 预计阶段 |
|------|------|----------|
| **视频/GIF 演示支持** | Skill 详情页支持视频和 GIF 播放 | M8 |
| **实时 WebSocket 通知** | 从"下次加载显示"升级为实时推送 | M8 |
| **用户举报功能** | 用户可以举报不当内容，管理员收到通知后处理 | M8 |
| **Skill 版本历史** | 查看 Skill 的更新历史记录，支持对比版本差异 | M8 |
| **内容审核机制** | 新上传 Skill 可选择需管理员审核后展示 | M8 |
| **搜索增强** | 从 LIKE 升级为 pg_trgm 全文搜索，支持中文分词 | M8 |
| **CDN/对象存储** | 文件存储迁移到 OSS/S3，提升访问速度 | M8 |
| **邮箱通知** | 重要更新通过邮件通知用户（可选订阅） | M8 |
| **Skill 分类体系** | 除标签外增加分类维度（如办公效率、数据处理等） | M9 |
| **团队/部门统计** | 按部门维度统计 Skills 贡献和下载情况 | M9 |

---

## 完成摘要

### 视觉驱动开发流程

```
F1 全局样式 → [✅验收] → F2 布局 → [✅验收] → F3 认证页 → [✅验收] →
F4 首页 → [✅验收] → F5 详情页 → [✅验收] → F6 组件调整 → [⏭️跳过] →
M6.6 上传页 → [✅验收] → M6.7 编辑页 → [✅验收] → M6.8 个人中心 → [✅验收] →
M6.9 管理员后台 → [验收] → 部署上线
```

### 验收检查清单（每个阶段）

**视觉验收**（人工检查）：
- [ ] 截图对比 design-system.md 规范
- [ ] 双主题切换正常
- [ ] 玻璃拟态效果可见
- [ ] 响应式布局正常

**代码验收**（自动化）：
- [ ] `npm run lint` 无错误
- [ ] `npm run type-check` 无错误
- [ ] 浏览器控制台无报错

**功能验收**（人工测试）：
- [ ] 页面可正常访问
- [ ] 交互功能正常
- [ ] 路由跳转正常

### 当前阻塞

| 阻塞项 | 依赖 | 状态 |
|--------|------|------|
| ~~F6 shadcn/ui 组件调整~~ | ~~F5 完成~~ | ⏭️ 已跳过 |
| ~~M6.6 Skill 上传页~~ | ~~F 重构完成~~ | ✅ 已完成并验收 |
| ~~M6.7 Skill 编辑页~~ | ~~M6.6 完成~~ | ✅ 已完成并验收 |
| ~~M6.8 个人中心~~ | ~~M6.7 完成~~ | ✅ 已完成并验收 |
| M6.9 管理员后台 | M6.8 完成 | 🟡 下一个待开发 |

---

## 已知 Bug 列表（待修复）

> 以下 Bug 已确认存在，暂未影响核心流程，安排在后续迭代中修复。

| # | 优先级 | 位置 | 现象 | 根本原因 | 修复建议 |
|---|--------|------|------|----------|----------|
| B1 | 🟡 中 | 详情页 `SkillDetail.tsx` | 作者信息显示 `Invalid Date`，作者名显示 `?` | `GET /skills/{id}` 的 `author_username` 硬编码为空字符串（`skills.py` 第 304 行）；前端 `created_at` 日期解析异常 | 后端：同 `list_skills` 一样批量查询作者信息；前端：检查日期字段 camelCase 映射 |
| B2 | 🟡 中 | 详情页下载按钮 | 显示 `下载 (NaN undefined)` | `SkillResponse.rating_avg` 为 `Decimal` 类型，Pydantic 序列化后为字符串 `"0.0"`；`file_size` 单位格式化收到意外值 | 后端 schema 将 `rating_avg` 改为 `float`；前端做 `parseFloat()` 兜底处理 |
| B3 | 🟢 低 | 数据库迁移 | `users.is_active` 字段通过 `ALTER TABLE` 直接添加，无 Alembic 迁移文件 | 临时修复未补写迁移 | 在 `backend/alembic/versions/` 补写迁移：`op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))` |

---

## 快速参考

**后端已就绪：**
- Python 3.11 + FastAPI + SQLModel (异步) 环境配置完成
- PostgreSQL 15 (Docker) 运行中，端口 5432
- 核心模块：`config.py`, `database.py`, `security.py`, `exceptions.py`
- 数据模型：`user`, `skill`, `comment`, `favorite`, `rating`, `notification`, `tag`
- API 路由：auth, skills, comments, notifications, admin (完整), users, tags (219 测试通过)
- Alembic 迁移配置完成
- 代码质量：Ruff + MyPy 无错误
- 启动命令：`python -m app.main` → http://localhost:8000

**前端状态：**
- Vite + React 18 + TypeScript 5 + Tailwind CSS 环境配置完成
- ESLint + Prettier 配置完成
- **F1 全局样式与主题系统 ✅ 已完成**（渐变背景 + 光晕动画 + 双主题 + 字体）
- **F2 布局组件重构 ✅ 已完成**（Header/Footer/Sidebar/Layout 玻璃拟态改造）
- **F3 认证页面重构 ✅ 已完成**（Login/Register 玻璃拟态卡片 + 焦点光环 + 密码强度指示器）
- **F4 首页重构 ✅ 已完成**（Hero 区域 + SVG 环形统计 + 搜索框 + Tab + SkillCard 玻璃拟态）
- **F5 Skill 详情页重构 ✅ 已完成**（玻璃拟态主卡片/交互区/评论区/文件树双主题适配）
- **F6 ⏭️ 已跳过**（shadcn/ui 组件样式，F1-F5 方案已满足需求）
- **M6.6 Skill 上传页 ✅ 已完成并验收**（三步式上传 + react-simplemde-editor + Playwright 验收通过）
- **M6.7 Skill 编辑页 ✅ 已完成并验收**（单页表单 + 权限检查 + 玻璃拟态 Toast）
- **M6.8 个人中心 ✅ 已完成并验收**（UserProfile 嵌套布局 + UserSkills/Favorites/Comments 子页面 + SVG 统计面板）
- **当前优先级：M6.9 管理员后台**
- 启动命令：`npm run dev` → http://localhost:5173

**Playwright MCP 测试指南：**

> 注意：Playwright MCP 测试时容易遇到 401 认证错误，按以下步骤操作：

**问题原因：**
- `useAuth` 的 `initAuth` 是异步的，PrivateRoute 在 token 验证完成前就判断未登录
- 每次 `browser_navigate` 后 React 应用重新挂载，需要等待 `initAuth` 完成

**正确测试流程：**
```javascript
// Step 1: 获取有效 Token（每次新会话）
// 在 bash 中执行：
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test%40test.com&password=Test1234" | \
  python -c "import json,sys; print(json.load(sys.stdin)['access_token'])"

// Step 2: 在 Playwright 中设置 Token 并等待初始化
await page.evaluate((token) => {
  localStorage.setItem('token', token);
}, '粘贴上面获取的token');

// Step 3: 访问页面并等待 initAuth 完成
await page.goto('http://localhost:5173/目标页面');
await page.waitForTimeout(2000); // 关键：等待 useAuth 初始化完成
```

**测试账户：** `test@test.com` / `Test1234`

---

**快速启动指南：**
```powershell
# 终端 1 - 数据库（如未启动）
docker-compose up -d postgres

# 终端 2 - 后端
cd backend
.\venv\Scripts\Activate.ps1
python -m app.main

# 终端 3 - 前端
cd frontend
npm run dev
```

---

## 参考文档

| 文档 | 说明 | 当前版本 |
|------|------|----------|
| [PRD.md](./PRD.md) | 产品需求文档 | v1.2 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 架构设计文档 | v1.1 |
| [CLAUDE.md](./CLAUDE.md) | 编程规范 | - |
| [design-system.md](./design-system.md) | **视觉设计系统（重构依据）** | v1.0 |
| [M6-Frontend-Checklist.md](./M6-Frontend-Checklist.md) | 前端开发清单（旧） | - |

*本文档随项目进展持续更新。*
