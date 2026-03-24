# OpenClaw Skills Hub - 项目进度文档

> 本文档记录 OpenClaw Skills Hub 的完整施工计划与当前进度
> 最后更新：2026-03-23
> **当前状态：前后端全部完成，进入前后端联调与 Bug 修复阶段**

## 最新更新 (2026-03-22)

### 新增功能

| 功能 | 说明 | 状态 |
|------|------|------|
| **SkillDetail 布局重构** | 标签云移到右侧互动区顶部；文件树移到使用方法下方 | ✅ 已完成 |
| **文件预览功能** | 点击文件树中的 `.md` 文件可在下方展开预览 | ✅ 已完成 |
| **Markdown 编辑器图片上传** | 使用场景/使用方法编辑器支持拖拽/粘贴图片上传 | ✅ 已完成 |
| **编辑器并排预览（Side-by-side）** | SkillUpload / SkillEdit 工具栏新增 Side-by-side 和 Fullscreen 按钮 | ✅ 已完成 |
| **详情页 Markdown 渲染修复** | `description`（简介）和 `usage_scenario`（使用场景）由纯文本改为 `MarkdownPreview` 渲染 | ✅ 已完成 |

### 新增 API
- `GET /skills/{id}/files/{path}` - 获取 Skill 包内文本文件内容
- `POST /skills/{id}/content-images` - 上传编辑器内图片（限 2MB）

---

**📍 当前聚焦 (Current Focus):**
- **前后端联调 & Bug 修复** — 16 个前端页面已通过视觉验收，225 个后端测试通过，现重点打通所有真实 API 交互，修复发现的集成 Bug

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
| F: 前端视觉重构 | 20 | 100% | 🟢 已完成 | F6 跳过 |
| M6: 前端页面功能 | 10 | 100% | 🟢 已完成 | - |
| **联调 & Bug 修复** | - | 进行中 | 🟡 进行中 | - |
| M7: 部署上线 | 3 | 0% | 🔴 未开始 | 联调完成 |
| M8: 后续功能（Post-MVP） | 10 | 0% | 🔴 未开始 | M7 |

**图例**：🔴 未开始 / 🟡 进行中 / 🟢 已完成 / ⚪ 阻塞

---

## 已完成工作总结

### M1: 基础设施 ✅
Python 3.11 + FastAPI + SQLModel + PostgreSQL；Vite + React 18 + TypeScript 5 + Tailwind CSS；Ruff + MyPy + ESLint + Prettier 代码质量工具链。

### M2: 用户认证 ✅
JWT Access Token（24h）+ Refresh Token HttpOnly Cookie（7天）；bcrypt 密码加密；注册/登录/刷新/登出完整路由；`get_current_user` / `get_current_admin` 依赖注入。单元测试 17 + 集成测试 14。

### M3: Skill 核心 ✅
Skill/Tag/Favorite/Rating 数据模型；CRUD + 搜索（LIKE + 标签筛选）+ 热度排序（SQL 表达式：评分×20 + 下载×2 + 收藏×5）；评分统计聚合。单元测试 63 + 集成测试 31。

### M4: 互动功能 ✅
Comment 模型（支持嵌套回复）；Notification 服务（Skill 更新时推送收藏者）；评论/通知完整 API 路由。单元测试 79 + 集成测试 40。

### M5: 管理后台基础 ✅
置顶/取消置顶；强制删除评论；导出 Skills/Users/Tags CSV；标签合并。集成测试 12。

### M5.5: 后端接口补充 ✅
`GET /me/stats`（真实 DB 查询）；`GET /tags`（公开）；修复 `author_username` 和评论 `username` 字段返回。新增 15 个测试，累计 168。

### M5.6: 管理员功能扩展 ✅
AdminService 服务层；Skill 管理（编辑/强制删除/软删除/恢复/下载用户列表）；用户管理（分页搜索/设管理员/启用禁用）；评论管理；平台概览统计；活跃用户榜单；`download_logs` 表；`users.is_active` 字段；Alembic 迁移文件。单元测试 17 + 集成测试 16，累计 202。

### F: 前端视觉重构 ✅（F6 跳过）
- **F1 全局样式**：CSS 变量双主题系统（白天/夜间）、背景光晕动画、ThemeContext/ThemeProvider/useTheme。
- **F2 布局重构**：Header/Footer/Sidebar/Layout 玻璃拟态改造，App.tsx 路由架构重构。
- **F3 认证页面**：Login/Register 玻璃拟态卡片，密码强度指示器，主题切换按钮。
- **F4 首页**：Hero 区域 SVG 环形统计、玻璃拟态搜索框、Tab 切换、SkillCard 悬浮动效。
- **F5 Skill 详情页**：玻璃拟态主卡片/评分组件/评论区/文件树，渐变标题 + 渐变下载按钮。
- **F6 跳过**：shadcn/ui 组件底层样式修改，F1-F5 方案已满足需求。
- 全部通过 Playwright 双主题视觉验收，`npm run lint && type-check` 无错误。

### M6: 前端页面功能 ✅（含 M6.6–M6.9）
| 页面 | 文件 | 关键功能 |
|------|------|---------|
| Skill 上传页 | `SkillUpload.tsx` | 三步式流程、拖拽上传、字数计数、Markdown 编辑器 |
| Skill 编辑页 | `SkillEdit.tsx` | 预填充表单、权限检查、可选重上传、Toast 反馈 |
| 个人中心 | `UserProfile.tsx` + 3 子页 | 嵌套路由、SVG 统计图表、我的 Skills/收藏/评论 |
| 管理后台 | `AdminLayout` + 5 子页 | Dashboard/Skills/Users/Comments/Stats，复用主站 Header |
| 架构漂移修复 | 8 项 | 热度算法 SQL、导出路由重命名、架构文档同步 |

225 个后端测试全部通过（2026-03-22，含 B10/B11 修复后验证）。

---

## 当前阶段：前后端联调 & Bug 修复 🟡

### 已知 Bug 记录

| # | 优先级 | 位置 | 状态 | 说明 |
|---|--------|------|------|------|
| B1 | 🟡 中 | Trending API 响应格式 | ✅ 已修复 | `/trending` `/top-rated` `/most-downloaded` 返回裸数组，前端期望分页格式 |
| B2 | 🟡 中 | 详情页作者信息 | ✅ 已修复 | 后端已正确返回 `author_username`；前端日期解析正常 |
| B3 | 🟡 中 | 详情页下载文件大小 | ✅ 已修复 | `formatFileSize` 增加 `!bytes \|\| bytes <= 0` 防御 |
| B4 | 🟢 低 | 数据库迁移 | ✅ 已修复 | 补写 `a1b2c3d4e5f6` Alembic 迁移（`is_active` + `download_logs`） |
| B5 | 🔴 高 | 游客收藏/评分无登录提示 | ✅ 已修复 | 移除 disabled={!user} 和 readonly={!user}，handler 已有跳转逻辑 |
| B6 | 🔴 高 | 下载功能无效 | ✅ 已修复 | 修复后端 download_url 路径错误（/api/v1/files→/uploads/实际文件名），修复前端 data.url→data.download_url，iframe 改为 anchor 下载 |
| B7 | 🔴 高 | 标签筛选 500 错误 | ✅ 已修复 | JSON 列不能直接用 .like()，改为 cast(Skill.tags, String).ilike() |
| B8 | 🔴 高 | 详情页评论完全不显示 | ✅ 已修复 | 双重根因：①后端返回裸数组，前端用 `commentsData?.items`（undefined）→ 永远 `[]`；②类型定义 camelCase 与后端 snake_case 不匹配（userId→user_id、createdAt→created_at 等）；顺带修复 B5 遗留问题（补传 onDeleteComment 显示删除按钮） |
| B9 | 🟡 中 | 搜索页标签云不显示 | ✅ 已修复 | `Tag` 表永远为空（skill 创建时未同步），`GET /api/v1/tags/` 改为从 `skills.tags` JSON 列聚合，Python Counter 实现，兼容 PostgreSQL 和 SQLite 测试环境 |
| B10 | 🔴 高 | 通知服务未集成 | ✅ 已修复 | `update_skill` 路由补充收藏者批量通知（`skill_update` 类型）；`comments.py` 补充作者单条通知（`new_comment` 类型）；两处均排除自操作场景 |
| B11 | 🟡 中 | 下载日志未写入 | ✅ 已修复 | `download_skill` 路由增加 `Request` + 可选 `current_user` 参数，每次下载创建 `DownloadLog`；登录用户记录 `user_id`，游客记录 `ip_address` |
| B12 | 🔴 高 | CORS 配置字段名错误 | ✅ 已修复 | `config.py` 中字段名 `CORSallowed_origins: List[str]` 与环境变量 `ALLOWED_ORIGINS` 不匹配，导致 pydantic-settings 解析报错；根因：pydantic v2 对 `List[str]` 要求 JSON 格式；修复：改为 `allowed_origins: str`，用 `cors_origins` property 手动 split |
| B13 | 🔴 高 | 上传 Skill 未解压 zip / file_tree 始终 None | ✅ 已修复 | `create_skill` 路由调用 `save_upload_file` 只保存 zip，从未调用 `extract_zip_file()`，导致 `extracted/` 目录不存在、`file_tree` 永远 None；修复：在保存文件后补充解压逻辑并将 `children` 数组写入 `skill.file_tree`，同时对已有 3 个 Skill 执行 DB 回填 |
| B14 | 🔴 高 | `GET /skills/{id}/files/{path}` 404 | ✅ 已修复 | `get_skill_file` 在 `Path(skill.file_path).parent/` 查找文件，但文件实际在 `extracted/` 子目录；修复：优先检查 `extracted/` 是否存在，存在则从该目录解析文件路径 |
| B15 | 🟡 中 | `file_tree` 类型 dict vs list 不一致 | ✅ 已修复 | `file_service.get_file_tree()` 返回根文件夹 `dict`，而 `SkillDetailResponse`/`SkillResponse` 中声明为 `dict \| None`，导致 pydantic v2 在保存 list 时抛 ValidationError；前端 `file_tree.length` 对 dict 求值也为 false；修复：三处均改为 `list \| None`，提取 `children` 数组存储 |
| B16 | 🔴 高 | `@tailwindcss/typography` 未安装，MarkdownPreview 样式全部失效 | ✅ 已修复 | `tailwind.config.js` `plugins: []` 为空，`prose`/`prose-slate` 类无实际 CSS 输出；根因：漏装插件；表现：标题无大号字体、链接无蓝色、列表无缩进符号 |
| B17 | 🟡 中 | 编辑器图片拖拽/粘贴上传不可用 | ✅ 已修复 | 根因：`createMdEditorOptions` 缺少 `uploadImage: true`；EasyMDE 仅在该选项为 true 时才注册 paste/drop 事件拦截器，否则只有工具栏按钮有效；修复：在 SkillUpload.tsx 和 SkillEdit.tsx 均补加 `uploadImage: true` |
| B18 | 🟡 中 | MarkdownPreview 链接无蓝色高亮 | ✅ 已修复 | 同 B16 根因：`prose` 未生效，`<a>` 标签无蓝色/下划线样式；随 B16 同步修复 |
| B19 | 🔴 高 | 文件树不显示（压缩包内容不可见） | ✅ 已修复 | 根因：后端 `file_service.py` 返回 `type: "folder"`，但前端 `FileTree.tsx` 期望 `type: "directory"`；修复：将后端 `"folder"` 改为 `"directory"`，并对已有 7 个 Skill 执行 DB 回填 |
| B20 | 🟡 中 | 文件树默认完全展开，不够简洁 | ✅ 已修复 | 改进：文件树默认只展开根目录，子文件夹默认收起，用户可手动展开；显示简洁美观 |
| B21 | 🔴 高 | uploads 路径配置错误 | ✅ 已修复 | 根因：`.env.backend` 中 `UPLOAD_DIR=./uploads` 指向 `backend/uploads`，而非项目根目录的 `uploads/skills`；修复：改为 `UPLOAD_DIR=../uploads/skills`，确保静态文件服务正确指向根目录 |
| B22 | 🔴 高 | 封面 API 返回 cover_url 为 null | ✅ 已修复 | 根因：`get_skill_detail` 函数返回 `SkillDetailResponse` 时遗漏了 `cover_url` 字段；修复：添加 `cover_url=skill.cover_url` |
| B23 | 🔴 高 | 列表 API 未返回 cover_url | ✅ 已修复 | 根因：`list_skills`/`get_trending_skills`/`get_top_rated_skills`/`get_most_downloaded_skills` 四个函数在构建 `SkillListResponse` 时遗漏 `cover_url=skill.cover_url`；修复：四处均添加 `cover_url=skill.cover_url` |
| B24 | 🟡 中 | 编辑页封面交互冗余 | ✅ 已修复 | 原有两个按钮（"更换封面"+"X删除"）交互冗余，X 按钮点击无反应（JS 事件穿透问题）；修复：移除"更换封面"按钮，只保留"移除封面"按钮，使用 CSS `:hover` 替代 JS 事件控制悬浮显示 |
| B25 | 🟡 中 | 封面修改后显示旧图 | ✅ 已修复 | 根因：浏览器缓存旧封面图片，导致用户误以为"无法保存"；修复：封面上传 API 返回带时间戳的 URL（`?t=timestamp`）强制刷新浏览器缓存 |
| B26 | 🔴 高 | 管理员无法编辑他人 Skill | ✅ 已修复 | 根因：前端 `SkillEdit.tsx` 权限检查只判断 `isAuthor`，未考虑 `is_admin`；修复：增加 `isAdmin` 判断条件 |
| B27 | 🔴 高 | 封面更换后仍显示旧封面 | ✅ 已修复 | 双重根因：①前端"移除封面"只是标记状态，未立即调用 API；②后端 API 返回的 `cover_url` 无时间戳，浏览器使用缓存；修复：①`handleRemoveCover` 改为立即调用 `deleteCover` API；②添加 `_add_cover_timestamp()` 函数，所有返回 `cover_url` 的 API 均添加 `?t=timestamp` |

> 新 Bug 在联调过程中持续补充此表。

### T3 测试结果（2026-03-22）

| 模块 | 通过 | 跳过 | 失败 |
|------|------|------|------|
| T3.1 上传 | 7/8 | 1（T3.1.3 大文件） | 0 |
| T3.2 编辑 | 3/4 | 1（T3.2.3 可选） | 0 |
| T3.3 删除 | 3/3 | 0 | 0 |
| T3.4 个人中心（作者） | 3/3 | 0 | 0 |

**备注**：
- T3.2.2 保存成功后无 Toast 提示（直接跳转，功能正常）
- TestAuthorSkill 名称已变更为 "TestAuthorSkill-已编辑"（T3.2.2 正常测试结果）

### T1.2 搜索功能测试结果（2026-03-22）

| 模块 | 通过 | 跳过 | 失败 |
|------|------|------|------|
| T1.2 搜索功能 | 5/5 | 0 | 0 |

**备注**：
- T1.2.4 修复 B9（Tag 表为空）后通过，TagCloud 侧边栏现正常渲染 6 个标签

### T4 测试结果（2026-03-22）

| 模块 | 通过 | 跳过 | 失败 |
|------|------|------|------|
| T4.1 路由与权限 | 5/5 | 0 | 0 |
| T4.2 Dashboard | 2/2 | 0 | 0 |
| T4.3 Skill 管理 | 8/8 | 0 | 0 |
| T4.4 用户管理 | 7/7 | 0 | 0 |
| T4.5 评论管理 | 3/3 | 0 | 0 |
| T4.6 数据统计与导出 | 6/6 | 0 | 0 |

**备注**：
- T4.3.3 取消置顶：实现为同一 `POST /admin/skills/:id/pin` toggle，非独立 DELETE 路由（清单描述有误）
- T4.3.5 强制删除：实现为物理删除（DELETE 返回 204），非软删除（清单描述有误）
- T4.4.6 禁用后登录：返回 401（非 403），HTTP 语义正确，"账号已被禁用"提示正常显示
- T4.6.1 active-users 响应格式为 `{items: [...], days: N}` 非裸数组

### T7 测试结果（2026-03-22）

| 模块 | 通过 | 跳过 | 失败 |
|------|------|------|------|
| T7.1 工具栏功能（9 项） | 9/9 | 0 | 0 |
| T7.2 输入体验（5 项） | 4/5 | 1（T7.2.4 图片粘贴，需手动验收） | 0 |
| T7.3 详情页 MD 渲染（6 项） | 6/6 | 0 | 0 |

**备注**：
- T7.1.5 无序列表：EasyMDE 输出 `* item`（非 `- item`），为标准 Markdown 语法，测试脚本期望值已修正
- T7.1.9 Side-by-side：`.editor-preview-side` 正常出现，并排预览功能有效（新增功能）
- T7.3 全通：`description`/`usage_scenario` 改用 `MarkdownPreview` 后，`strong/em/li/h1/code` 全部正确渲染，无裸露 `**` 符号

### T6 测试结果（2026-03-22）

| 模块 | 通过 | 跳过 | 失败 |
|------|------|------|------|
| T6.1 SkillDetail 布局 | 2/2 | 0 | 0 |
| T6.2 文件预览 | 5/5 | 0 | 0 |
| T6.3 Markdown 图片上传 | 4/4 | 0 | 0 |

**备注**：
- T6.1 全部通过：标签云确在右侧第一位，文件树确在使用方法后、评论前
- T6.2.4 复测通过：关闭按钮为 SVG-only 按钮（无文本，class `p-1 rounded-lg`），点击后 previewArea 消失，按钮数 25→24；前次失败原因是选择器用文本匹配，漏检了 SVG 图标按钮
- T6.3.1/T6.3.4：上传页 Step2 和编辑页均有 `title="Insert Image (Ctrl-Alt-I)"` 工具栏按钮
- T6.3.2：`POST /skills/{id}/content-images` 返回 `{ url: "..." }`
- T6.3.3：上传 2.1MB 文件返回 400，API 正确拒绝超大文件

### T5 测试结果（2026-03-22）

| 模块 | 通过 | 跳过 | 失败 |
|------|------|------|------|
| T5.2 上传→首页显示 | 1/1 | 0 | 0 |
| T5.4 禁用→访问拦截 | 1/1 | 0 | 0 |
| T5.1 收藏→更新→通知 | 1/1 | 0 | 0（B10 已修复） |
| T5.3 评论→通知 | 1/1 | 0 | 0（B10 已修复） |
| T5.5 搜索→下载→统计 | 1/1 | 0 | 0（B11 已修复） |

**备注**：
- T5.4 全流程验证：禁用后旧 token 操作返回 403，重新登录返回 401 + "账号已被禁用"提示，重新启用后恢复正常 ✅
- T5.2 全流程验证：作者通过 API 上传新 Skill，游客首页和搜索页均立即可见 ✅
- T5.1/T5.3 根本原因：`NotificationService` 完整实现但从未在业务路由中被调用
- T5.5 根本原因：`download_skill` 路由只调用 `increment_download_count`，未写 `DownloadLog` 记录

### T8 测试结果（2026-03-23）

| 模块 | 通过 | 跳过 | 失败 |
|------|------|------|------|
| T8.1 上传页封面上传（6 项） | 6/6 | 0 | 0 |
| T8.2 编辑页封面修改（4 项） | 4/4 | 0 | 0 |
| T8.3 首页卡片封面显示（3 项） | 3/3 | 0 | 0 |
| T8.4 详情页封面显示（2 项） | 2/2 | 0 | 0 |
| T8.5 封面 API 测试（3 项） | 2/3 | 1 | 0 |

**备注**：
- T8.1.3/T8.1.4/T8.1.5：文件校验和删除功能均通过 Playwright 自动化测试 ✅
- T8.1.6：需要完整上传流程，跳过
- T8.2.1-T8.2.4：编辑页封面回填、修改、取消功能全部通过 ✅
- T8.2.4 新增"更换"按钮修复了无法直接选择新封面的问题
- T8.3.1：列表 API 返回 `cover_url`（B23 已修复），首页所有 Tab 均正确显示封面 ✅
- T8.3.2：无封面卡片显示 emoji 占位符 ✅
- T8.4.1/T8.4.2：详情页封面显示/隐藏逻辑正确
- T8.5.1/T8.5.3：封面上传 API 和返回字段测试通过
- T8.5.2：封面覆盖需手动验收

---

## M7: 部署上线 🔴 (0%)

- [ ] **M7.1** 生产环境配置（环境变量、CORS、日志）
- [ ] **M7.2** 部署脚本（后端 / 前端构建 / 数据库迁移）
- [ ] **M7.3** 上线检查清单（代码质量、备份策略）

---

## M8: 后续功能（Post-MVP）🔴 (0%)

| 功能 | 说明 |
|------|------|
| 视频/GIF 演示支持 | Skill 详情页支持视频播放 |
| 实时 WebSocket 通知 | 从轮询升级为实时推送 |
| 用户举报功能 | 举报不当内容，管理员审核 |
| Skill 版本历史 | 查看更新历史，支持版本对比 |
| 内容审核机制 | 新上传 Skill 可配置审核流程 |
| 搜索增强 | 升级为 pg_trgm 全文搜索 |
| CDN/对象存储 | 文件存储迁移到 OSS/S3 |
| 邮箱通知 | 重要更新邮件通知（可订阅） |
| Skill 分类体系 | 增加分类维度（办公/数据等） |
| 团队/部门统计 | 按部门维度统计贡献和下载 |

---

## 快速参考

### 启动命令
```powershell
# 终端 1 - 数据库（如未启动）
docker-compose up -d postgres

# 终端 2 - 后端
cd backend && .\venv\Scripts\Activate.ps1 && python -m app.main
# → http://localhost:8000  API 文档: http://localhost:8000/docs

# 终端 3 - 前端
cd frontend && npm run dev
# → http://localhost:5173
```

### 测试账户
- 普通用户：`test@test.com` / `Test1234`
- 管理员：见本地 `.env` 配置

### Playwright 联调注意事项
`useAuth` 的 `initAuth` 是异步的，每次 `browser_navigate` 后需等待初始化：
```javascript
// 1. bash 获取 token
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test%40test.com&password=Test1234" | \
  python -c "import json,sys; print(json.load(sys.stdin)['access_token'])"

// 2. Playwright 注入并等待
await page.evaluate(token => localStorage.setItem('token', token), '<token>');
await page.goto('http://localhost:5173/目标页面');
await page.waitForTimeout(2000); // 等待 initAuth 完成
```

### 代码质量命令
```bash
# 后端
cd backend && ruff check app && ruff format app --check && mypy app
python -m pytest tests/ -q  # 225 tests

# 前端
cd frontend && npm run lint:fix && npm run type-check
```

### 参考文档
| 文档 | 说明 |
|------|------|
| [PRD.md](./PRD.md) | 产品需求文档 v1.2 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 架构设计文档 v1.1 |
| [CLAUDE.md](./CLAUDE.md) | 编程规范 |

*本文档随项目进展持续更新。*
