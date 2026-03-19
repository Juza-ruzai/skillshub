# OpenClaw Skills Hub - 项目进度文档

> 本文档记录 OpenClaw Skills Hub 的完整施工计划与当前进度
> 最后更新：2026-03-19（F2 布局组件重构完成，Header/Footer/Sidebar/Layout 玻璃拟态改造完成）
> **当前状态：F3 认证页面重构（Login/Register 玻璃拟态卡片），后端全部完成（202测试通过）**

---

**📍 当前聚焦 (Current Focus):**
- **F3: 认证页面重构** - Login/Register 玻璃拟态卡片
- **F4+: 后续页面重构** - 首页/详情页/组件库（依赖 F2-F3）

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
| **F: 前端视觉重构** | **20** | **35%** | 🟡 **进行中** | **F2 已完成，F3 进行中** |
| M6: 前端页面功能 | 10 | 70% | 🟡 进行中 | **F 重构完成** |
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

## F: 前端视觉重构 🟡 (15%)

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

### F3: 认证页面重构

- [ ] **F3.1** Login 页重构 (`src/pages/Login.tsx`)
  - [ ] 玻璃拟态登录卡片
  - [ ] 渐变背景下的表单布局
  - [ ] 输入框玻璃拟态样式
  - [ ] 渐变主按钮（悬浮放大效果）

- [ ] **F3.2** Register 页重构 (`src/pages/Register.tsx`)
  - [ ] 玻璃拟态注册卡片
  - [ ] 密码强度指示器（主题色）

**验收标准：**
- [ ] 登录页显示渐变背景 + 玻璃卡片
- [ ] 表单输入有焦点光环效果
- [ ] 按钮悬浮有放大 + 阴影效果
- [ ] 夜间模式切换后表单可读
- [ ] 验收员截图确认效果

**阻塞项：** 完成后方可进入 F4

---

### F4: 首页重构

- [ ] **F4.1** Hero 区域 (`src/pages/Home.tsx`)
  - [ ] 渐变 Slogan 文字效果
  - [ ] 统计数字环形进度条（SVG 渐变）
  - [ ] 玻璃拟态搜索框

- [ ] **F4.2** Tab 切换
  - [ ] 玻璃拟态 Tab 按钮
  - [ ] 激活状态高亮效果

- [ ] **F4.3** Skill 卡片网格
  - [ ] SkillCard 玻璃拟态重构
  - [ ] 卡片悬浮动效（translateY + 阴影）
  - [ ] 渐变占位图背景

**验收标准：**
- [ ] Hero 区域有环形进度统计
- [ ] 搜索框玻璃拟态效果
- [ ] Skill 卡片悬浮有动效
- [ ] Tab 切换视觉正常
- [ ] 验收员截图确认效果

**阻塞项：** 完成后方可进入 F5

---

### F5: Skill 详情页重构

- [ ] **F5.1** 信息展示区 (`src/pages/SkillDetail.tsx`)
  - [ ] 玻璃拟态主卡片
  - [ ] 渐变标题效果
  - [ ] 文件树玻璃拟态样式

- [ ] **F5.2** 交互区
  - [ ] 玻璃拟态评分组件
  - [ ] 渐变收藏/下载按钮
  - [ ] 统计信息卡片

- [ ] **F5.3** 评论区
  - [ ] 玻璃拟态评论卡片
  - [ ] 嵌套回复视觉层次

**验收标准：**
- [ ] 详情页整体玻璃拟态风格
- [ ] 按钮渐变效果正确
- [ ] 评论区层次清晰
- [ ] 夜间模式可读性良好
- [ ] 验收员截图确认效果

**阻塞项：** 完成后方可进入 F6

---

### F6: shadcn/ui 组件样式调整

- [ ] **F6.1** Button 组件 (`src/components/ui/button.tsx`)
  - [ ] 添加 gradient 变体
  - [ ] 悬浮动效

- [ ] **F6.2** Card 组件 (`src/components/ui/card.tsx`)
  - [ ] 玻璃拟态默认样式

- [ ] **F6.3** Input 组件 (`src/components/ui/input.tsx`)
  - [ ] 半透明背景
  - [ ] 焦点光环效果

**验收标准：**
- [ ] shadcn 组件全局样式一致
- [ ] 代码质量检查通过

**阻塞项：** 完成后方可进入 M6 新功能开发

---

## M6: 前端页面功能 🟡 (70%)

> **依赖**：F 前端视觉重构完成后继续
> **开发模式**：视觉驱动 + 增量验收（每页完成即验收）

**说明**：原 M6.1-M6.5 功能已完成，但样式需随 F 重构同步更新。以下为新功能开发任务。

---

### M6.6: Skill 上传页 🔴

> **目标**：分步表单上传 Skill，保持玻璃拟态设计风格

- [ ] **M6.6.1** 页面框架 (`src/pages/SkillUpload.tsx`)
  - [ ] 玻璃拟态步骤条（Step 1/2/3）
  - [ ] 分步内容切换动画

- [ ] **M6.6.2** Step 1 - 文件上传
  - [ ] 拖拽上传区域（渐变边框 + 玻璃背景）
  - [ ] 文件类型校验（.zip / .md）
  - [ ] 上传进度条（渐变填充）

- [ ] **M6.6.3** Step 2 - 填写信息
  - [ ] 玻璃拟态表单卡片
  - [ ] 标签输入智能提示
  - [ ] 描述字数限制（10-50 字）实时提示

- [ ] **M6.6.4** Step 3 - 预览确认
  - [ ] Skill 预览卡片（玻璃拟态）
  - [ ] 提交按钮

- [ ] **M6.6.5** API 集成
  - [ ] 上传接口封装
  - [ ] 成功后跳转详情页

**验收标准：**
- [ ] 三步骤可正常切换
- [ ] 拖拽上传区域有渐变边框效果
- [ ] 非法文件类型阻止并提示
- [ ] 描述字数实时计数
- [ ] 提交成功跳转新 Skill 详情页
- [ ] **视觉验收**：截图确认符合 design-system

**阻塞项：** 依赖 F 重构完成

---

### M6.7: Skill 编辑页 🔴

> **目标**：编辑现有 Skill，复用上传页组件

- [ ] **M6.7.1** 页面框架 (`src/pages/SkillEdit.tsx`)
  - [ ] 加载现有数据填充表单
  - [ ] 权限检查（非作者重定向）

- [ ] **M6.7.2** 编辑功能
  - [ ] 可重新上传文件
  - [ ] 保存后显示成功提示（玻璃拟态 Toast）

**验收标准：**
- [ ] 编辑页正确加载现有数据
- [ ] 重新上传文件正常
- [ ] 保存后显示成功提示
- [ ] 非作者访问被重定向到 403/首页
- [ ] **视觉验收**：截图确认符合 design-system

**阻塞项：** 依赖 M6.6 完成

---

### M6.8: 个人中心 🔴

> **目标**：用户个人中心，展示 Skills/收藏/评论/统计

- [ ] **M6.8.1** 主页面框架 (`src/pages/UserProfile.tsx`)
  - [ ] 玻璃拟态用户信息卡片
  - [ ] 导航标签切换（我的 Skills / 收藏 / 评论）

- [ ] **M6.8.2** 作者统计面板
  - [ ] PV/UV 访问量展示
  - [ ] 下载/收藏总数（环形进度）
  - [ ] 评分分布图表（柱状图，玻璃拟态）
  - [ ] 7天/30天趋势图（折线图，玻璃拟态）

- [ ] **M6.8.3** 我的 Skills (`src/pages/UserSkills.tsx`)
  - [ ] Skill 列表（带编辑/删除按钮）
  - [ ] 删除确认对话框（玻璃拟态）
  - [ ] 空状态提示

- [ ] **M6.8.4** 我的收藏 (`src/pages/UserFavorites.tsx`)
  - [ ] 收藏的 Skill 列表
  - [ ] 取消收藏按钮

- [ ] **M6.8.5** 我的评论 (`src/pages/UserComments.tsx`)
  - [ ] 评论列表（玻璃拟态卡片）
  - [ ] 点击跳转对应 Skill
  - [ ] 删除评论按钮

**验收标准：**
- [ ] 用户信息正确展示
- [ ] 导航标签切换正确
- [ ] 图表正确渲染
- [ ] 我的 Skills 列表可操作
- [ ] 删除操作有确认对话框
- [ ] **视觉验收**：截图确认符合 design-system

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
F1 全局样式 → [✅验收] → F2 布局 → [✅验收] → F3 认证页 → [验收] →
F4 首页 → [验收] → F5 详情页 → [验收] → F6 组件调整 → [验收] →
M6.6 上传页 → [验收] → M6.7 编辑页 → [验收] → M6.8 个人中心 → [验收] →
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

| 阻塞项 | 依赖 | 预计解决 |
|--------|------|----------|
| F3 认证页重构 | F2 完成 | 进行中 |
| F4-F6 页面重构 | F3 完成 | F3 完成后 |
| M6 新功能开发 | F 重构完成（F1-F6） | F6 完成后 |

---

## 快速参考

**后端已就绪：**
- Python 3.11 + FastAPI + SQLModel (异步) 环境配置完成
- PostgreSQL 15 (Docker) 运行中，端口 5432
- 核心模块：`config.py`, `database.py`, `security.py`, `exceptions.py`
- 数据模型：`user`, `skill`, `comment`, `favorite`, `rating`, `notification`, `tag`
- API 路由：auth, skills, comments, notifications, admin (完整), users, tags (202 测试通过)
- Alembic 迁移配置完成
- 代码质量：Ruff + MyPy 无错误
- 启动命令：`python -m app.main` → http://localhost:8000

**前端状态：**
- Vite + React 18 + TypeScript 5 + Tailwind CSS 环境配置完成
- ESLint + Prettier 配置完成
- **F1 全局样式与主题系统 ✅ 已完成**（渐变背景 + 光晕动画 + 双主题 + 字体）
- **F2 布局组件重构 ✅ 已完成**（Header/Footer/Sidebar/Layout 玻璃拟态改造）
- **当前优先级：F3 认证页面重构**（Login/Register 玻璃拟态卡片）
- 启动命令：`npm run dev` → http://localhost:5173

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
