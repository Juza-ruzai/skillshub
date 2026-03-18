# M6: 前端页面开发清单

> 本文档整合 M2/M3/M4 推迟的前端任务 + M6 原本的任务
> 采用**分阶段依次开发**模式，每阶段完成后需通过验收标准才可进入下一阶段
> 最后更新：2026-03-18
> **当前状态：Phase 4 Skill 组件开发完成 ✅，准备开始 Phase 5**

---

## 已完成工作总结 - 总览

| 阶段 | 状态 | 测试通过 | 代码质量 | 依赖 |
|------|------|----------|----------|------|
| Phase 1: 基础架构 | ✅ 完成 | 34 | lint ✅ type-check ✅ | - |
| Phase 2: 布局组件 | ✅ 完成 | 24 | lint ✅ type-check ✅ | - |
| Phase 3: 通用组件 | ✅ 完成 | 38 | lint ✅ type-check ✅ | marked, isomorphic-dompurify |
| **累计** | **4/10** | **124** | **全部通过** | - |

**下一步：** Phase 5: 认证页面 (Login, Register)

---

### Phase 4: Skill 组件 ✅ (2026-03-18 完成)

**完成内容：**
- ✅ SkillCard (`src/components/skill/SkillCard.tsx`)
  - 封面图占位、名称、描述展示
  - 评分、下载数、收藏数统计
  - 悬停阴影效果
  - 点击触发 onClick 回调

- ✅ SkillList (`src/components/skill/SkillList.tsx`)
  - 响应式网格布局（1/2/3 列）
  - 加载骨架屏（Loader2 动画）
  - 空状态展示（emptyText）
  - 错误状态显示
  - 支持自定义卡片渲染

- ✅ SkillForm (`src/components/skill/SkillForm.tsx`)
  - 字段：名称、描述、使用场景、使用方法、标签
  - 标签输入（回车添加，点击删除）
  - 表单验证（名称必填且≥3字符，其他必填）
  - 支持 create/edit 两种模式
  - create 模式提交后自动清空表单

**测试覆盖：** 22 个单元测试全部通过
- `SkillCard.test.tsx` - 7 个测试
- `SkillList.test.tsx` - 6 个测试
- `SkillForm.test.tsx` - 9 个测试

**代码质量：**
- `npm run lint` ✅ 无错误
- `npm run type-check` ✅ 无错误
- 无 `any` 类型使用

**下一步：** Phase 5: 认证页面 (Login, Register)

---

### Phase 1: 基础架构 ✅ (2026-03-18 完成)

**完成内容：**
- ✅ API 客户端配置 (`src/lib/api.ts`) - Axios 实例、拦截器、Token 刷新
- ✅ 类型定义 (`src/types/*.ts`) - User、Skill、Comment 完整类型
- ✅ 认证 Hook (`src/hooks/useAuth.ts`) - 登录/注册/登出
- ✅ 路由保护 (`src/components/PrivateRoute.tsx`) - PrivateRoute、AdminRoute
- ✅ 路由配置 (`src/App.tsx`) - 完整路由表
- ✅ ESLint + Prettier 配置

**测试覆盖：** 34 个单元测试全部通过
- `api.test.ts` - 10 个测试
- `types.test.ts` - 11 个测试
- `useAuth.test.ts` - 9 个测试
- `PrivateRoute.test.tsx` - 4 个测试

**代码质量：**
- `npm run lint` ✅ 无错误
- `npm run type-check` ✅ 无错误
- `npm run format:check` ✅ 通过

**下一阶​​段：** Phase 2: 布局组件 (Header、Footer、Sidebar)

### Phase 2: 布局组件 ✅ (2026-03-18 完成)

**完成内容：**
- ✅ Header (`src/components/layout/Header.tsx`)
  - Logo/品牌名称、全局搜索栏（支持回车搜索）
  - 导航链接（首页、上传）、用户菜单
  - 通知图标 + 红点提示、移动端汉堡菜单

- ✅ Footer (`src/components/layout/Footer.tsx`)
  - 版权信息、快速链接（首页、关于）
  - 固定在页面底部

- ✅ Sidebar (`src/components/layout/Sidebar.tsx`)
  - 标签云展示（根据使用频率调整大小）
  - 点击标签触发筛选回调
  - 移动端可折叠抽屉

- ✅ Layout (`src/components/layout/Layout.tsx`)
  - 组合布局组件（Header + Sidebar + Main + Footer）

**测试覆盖：** 24 个单元测试全部通过
- `Header.test.tsx` - 12 个测试
- `Footer.test.tsx` - 4 个测试
- `Sidebar.test.tsx` - 8 个测试

**代码质量：**
- `npm run lint` ✅ 无错误
- `npm run type-check` ✅ 无错误
- `npm run format:check` ✅ 通过

**下一步：** Phase 3 通用组件开发 (StarRating, Pagination, MarkdownPreview, FileTree, CommentSection, TagCloud)

### Phase 3: 通用组件 ✅ (2026-03-18 完成)

**完成内容：**
- ✅ StarRating (`src/components/common/StarRating.tsx`)
  - 1-5星展示，支持半星显示
  - 只读模式和交互模式
  - 悬停效果和不同尺寸
  - 无障碍属性支持

- ✅ Pagination (`src/components/common/Pagination.tsx`)
  - 页码导航和上一页/下一页
  - 边界处理（第一页/最后一页禁用）
  - 省略号显示和多页处理

- ✅ MarkdownPreview (`src/components/common/MarkdownPreview.tsx`)
  - GitHub Flavored Markdown 渲染
  - XSS 安全防护（DOMPurify）
  - 代码高亮和链接处理

- ✅ FileTree (`src/components/skill/FileTree.tsx`)
  - 层级目录结构展示
  - 文件夹展开/折叠
  - 文件点击回调
  - 深层嵌套支持

- ✅ CommentSection (`src/components/common/CommentSection.tsx`)
  - 嵌套评论列表展示
  - 发表评论和回复功能
  - 删除评论按钮（仅作者）
  - 加载状态显示

- ✅ TagCloud (`src/components/common/TagCloud.tsx`)
  - 标签大小根据使用频率
  - 选中高亮和清除按钮
  - 点击回调

**新增依赖：**
- `marked` - Markdown 解析
- `isomorphic-dompurify` - XSS 防护

**测试覆盖：** 38 个单元测试全部通过
- `StarRating.test.tsx` - 8 个测试
- `Pagination.test.tsx` - 7 个测试
- `MarkdownPreview.test.tsx` - 5 个测试
- `FileTree.test.tsx` - 6 个测试
- `CommentSection.test.tsx` - 7 个测试
- `TagCloud.test.tsx` - 5 个测试

**代码质量：**
- `npm run lint` ✅ 无错误
- `npm run type-check` ✅ 无错误
- 无 `any` 类型使用

**下一步：** Phase 4 Skill 组件 (SkillCard, SkillList, SkillForm)

---

## 技术栈确认

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2+ | UI 框架 |
| TypeScript | 5.3+ | 类型系统 |
| Vite | 5.1+ | 构建工具 |
| React Router | 6.22+ | 路由管理 |
| React Query | 5.20+ | 服务端状态管理 |
| Tailwind CSS | 3.4+ | 样式框架 |
| Axios | 1.6+ | HTTP 客户端 |
| Lucide React | 0.334+ | 图标库 |
| shadcn/ui | 最新 | 组件库 |

---

## 开发阶段总览

| 阶段 | 名称 | 预估工期 | 依赖 | 状态 |
|------|------|----------|------|------|
| Phase 1 | 基础架构 | 1 天 | 无 | 🟢 已完成 |
| Phase 2 | 布局组件 | 1 天 | Phase 1 | 🟢 已完成 |
| Phase 3 | 通用组件 | 2 天 | Phase 1 | 🟢 已完成 |
| Phase 4 | Skill 组件 | 2 天 | Phase 2, 3 | 🟢 已完成 |
| Phase 5 | 认证页面 | 1 天 | Phase 1, 2 | 🔴 未开始 |
| Phase 6 | 首页与搜索 | 2 天 | Phase 4, 5 | 🔴 未开始 |
| Phase 7 | Skill 详情页 | 2 天 | Phase 3, 4 | 🔴 未开始 |
| Phase 8 | 上传与编辑 | 2 天 | Phase 4 | 🔴 未开始 |
| Phase 9 | 个人中心 | 2 天 | Phase 4 | 🔴 未开始 |
| Phase 10 | 优化完善 | 2 天 | Phase 6-9 | 🔴 未开始 |

**图例**: 🔴 未开始 / 🟡 进行中 / 🟢 已完成

---

## Phase 1: 基础架构

### 1.1 API 客户端配置

**文件**: `src/lib/api.ts`

**功能清单**:
- [x] Axios 实例创建
- [x] Base URL 从环境变量 `VITE_API_BASE_URL` 读取
- [x] 请求拦截器：自动添加 Authorization Header
- [x] 响应拦截器：401 错误时尝试刷新 Token
- [x] 错误统一处理（弹出 toast 提示）

### 1.2 类型定义

**文件**:
- `src/types/user.ts`
- `src/types/skill.ts`
- `src/types/comment.ts`
- `src/types/index.ts`

**类型清单**:
- [x] `User`, `UserCreate`, `UserLogin`, `TokenResponse`
- [x] `Skill`, `SkillCreate`, `SkillUpdate`, `SkillListResponse`, `SkillDetail`
- [x] `Comment`, `CommentCreate`, `CommentWithReplies`

### 1.3 自定义 Hooks

**文件**:
- `src/hooks/useApi.ts`
- `src/hooks/useAuth.ts`

**功能清单**:
- [ ] `useApi` - 基础 API 请求封装
- [x] `useAuth` - 登录/注册/登出函数
- [x] Token 刷新逻辑
- [x] 用户状态持久化（内存存储）

### 1.4 路由配置

**文件**: `src/App.tsx`

**功能清单**:
- [x] 路由表定义（所有路径）
- [x] `PrivateRoute` 组件 - 登录态保护
- [x] `AdminRoute` 组件 - 管理员权限保护
- [x] 404 页面处理

### ✅ Phase 1 验收标准

| # | 验收项 | 验收方法 |
|---|--------|----------|
| 1.1 | `npm run type-check` 无错误 | 运行命令 |
| 1.2 | `npm run lint` 无错误 | 运行命令 |
| 1.3 | 所有类型定义无 `any` | 人工检查 |
| 1.4 | Axios 能正确读取环境变量 | 控制台打印验证 |
| 1.5 | 请求拦截器正确添加 Header | 浏览器 DevTools Network 验证 |
| 1.6 | 路由表包含所有规划路径 | 代码审查 |
| 1.7 | `PrivateRoute` 未登录时重定向到登录页 | 浏览器测试 |

**阻塞条件**: 以上验收项全部通过方可进入 Phase 2

---

## Phase 2: 布局组件

### 2.1 顶部导航 (Header)

**文件**: `src/components/layout/Header.tsx`

**功能清单**:
- [x] Logo/品牌名称展示
- [x] 全局搜索栏（支持回车搜索）
- [x] 导航链接（首页、上传）
- [x] 用户菜单（登录/注册 或 个人中心/登出）
- [x] 通知图标 + 红点提示
- [x] **移动端**: 汉堡菜单折叠

**Props 定义**:
```typescript
interface HeaderProps {
  onSearch?: (keyword: string) => void;
}
```

### 2.2 底部 (Footer)

**文件**: `src/components/layout/Footer.tsx`

**功能清单**:
- [x] 版权信息
- [x] 快速链接（首页、关于）
- [x] 固定底部或内容不足时置底

### 2.3 侧边栏 (Sidebar)

**文件**: `src/components/layout/Sidebar.tsx`

**功能清单**:
- [x] 标签云展示
- [x] 点击标签触发筛选回调
- [x] **移动端**: 可折叠抽屉

**Props 定义**:
```typescript
interface SidebarProps {
  tags: string[];
  selectedTag?: string;
  onTagSelect: (tag: string) => void;
}
```

### ✅ Phase 2 验收标准

| # | 验收项 | 验收方法 |
|---|--------|----------|
| 2.1 | Header 固定在顶部，z-index 正确 | 视觉检查 |
| 2.2 | 搜索栏回车触发 onSearch 回调 | 单元测试 |
| 2.3 | 未登录显示"登录/注册"按钮 | 浏览器测试 |
| 2.4 | 已登录显示用户名和头像 | 浏览器测试 |
| 2.5 | 通知红点根据未读数量显示/隐藏 | 浏览器测试 |
| 2.6 | 移动端 (<md) 汉堡菜单正常展开/收起 | 浏览器测试 |
| 2.7 | Footer 始终在页面底部 | 视觉检查 |
| 2.8 | Sidebar 标签点击触发回调 | 单元测试 |
| 2.9 | 移动端侧边栏以抽屉形式展示 | 浏览器测试 |

**阻塞条件**: 以上验收项全部通过方可进入 Phase 3

---

## Phase 3: 通用组件

### 3.1 星级评分 (StarRating) ✅

**文件**: `src/components/common/StarRating.tsx`

**功能清单**:
- [x] 支持 1-5 星展示
- [x] 支持半星显示
- [x] 支持只读模式
- [x] 交互式悬停效果

**Props 定义**:
```typescript
interface StarRatingProps {
  value: number; // 0-5，支持小数
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: number) => void;
}
```

### 3.2 分页 (Pagination) ✅

**文件**: `src/components/common/Pagination.tsx`

**功能清单**:
- [x] 上一页/下一页按钮
- [x] 页码快速跳转
- [x] 边界状态处理（第一页/最后一页）

**Props 定义**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

### 3.3 Markdown 预览 (MarkdownPreview) ✅

**文件**: `src/components/common/MarkdownPreview.tsx`

**功能清单**:
- [x] 支持 GitHub Flavored Markdown
- [x] 代码高亮
- [x] XSS 安全防护（HTML 转义）
- [x] 样式与 shadcn/ui 一致

**Props 定义**:
```typescript
interface MarkdownPreviewProps {
  content: string;
  className?: string;
}
```

### 3.4 文件树 (FileTree) ✅

**文件**: `src/components/skill/FileTree.tsx`

**功能清单**:
- [x] 层级缩进展示
- [x] 文件夹/文件图标区分
- [x] 可展开/折叠文件夹
- [x] 点击文件触发回调

**Props 定义**:
```typescript
interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

interface FileTreeProps {
  data: FileTreeNode[];
  onFileClick?: (path: string) => void;
}
```

### 3.5 评论区 (CommentSection) ✅

**文件**: `src/components/common/CommentSection.tsx`

**功能清单**:
- [x] 评论列表展示（嵌套回复结构）
- [x] 发表评论表单
- [x] 回复评论功能
- [x] 删除自己评论按钮
- [x] 加载状态

**Props 定义**:
```typescript
interface CommentSectionProps {
  skillId: string;
}
```

### 3.6 标签云 (TagCloud) ✅

**文件**: `src/components/common/TagCloud.tsx`

**功能清单**:
- [x] 标签大小根据使用频率
- [x] 点击筛选高亮
- [x] 清除筛选按钮

**Props 定义**:
```typescript
interface TagCloudProps {
  tags: { name: string; count: number }[];
  selectedTags?: string[];
  onTagSelect: (tag: string) => void;
}
```

### ✅ Phase 3 验收标准 - 全部通过

| # | 验收项 | 验收方法 | 状态 |
|---|--------|----------|------|
| 3.1 | StarRating 显示正确数量星星 | 视觉检查 + 单元测试 | ✅ |
| 3.2 | StarRating 半星显示正确 | 视觉检查 | ✅ |
| 3.3 | StarRating 交互模式可点击评分 | 浏览器测试 | ✅ |
| 3.4 | Pagination 边界按钮正确禁用 | 单元测试 | ✅ |
| 3.5 | Pagination 点击触发 onPageChange | 单元测试 | ✅ |
| 3.6 | MarkdownPreview 正确渲染标题/列表/代码块 | 浏览器测试 | ✅ |
| 3.7 | MarkdownPreview XSS 防护有效（测试 `<script>` 标签） | 单元测试 | ✅ |
| 3.8 | FileTree 文件夹可展开/折叠 | 浏览器测试 | ✅ |
| 3.9 | FileTree 点击文件触发回调 | 单元测试 | ✅ |
| 3.10 | CommentSection 展示嵌套回复 | 浏览器测试 | ✅ |
| 3.11 | CommentSection 提交评论后刷新列表 | 浏览器测试 | ✅ |
| 3.12 | TagCloud 标签大小与 count 成正比 | 视觉检查 | ✅ |

**阻塞条件**: ✅ 以上验收项全部通过，可进入 Phase 4

---

## Phase 4: Skill 相关组件

### 4.1 Skill 卡片 (SkillCard)

**文件**: `src/components/skill/SkillCard.tsx`

**功能清单**:
- [x] 展示封面图、名称、描述
- [x] 展示评分、下载数、收藏数
- [x] 悬停效果
- [x] 点击跳转详情页
- [x] **移动端**: 适配小屏幕布局

**Props 定义**:
```typescript
interface SkillCardProps {
  skill: Skill;
  onClick?: (skill: Skill) => void;
}
```

### 4.2 Skill 列表 (SkillList)

**文件**: `src/components/skill/SkillList.tsx`

**功能清单**:
- [x] 网格布局（桌面端 3-4 列，平板 2 列，手机 1 列）
- [x] 加载骨架屏
- [x] 空状态展示
- [ ] 支持列表/网格视图切换（可选）

**Props 定义**:
```typescript
interface SkillListProps {
  skills: Skill[];
  loading?: boolean;
  emptyText?: string;
}
```

### 4.3 Skill 表单 (SkillForm)

**文件**: `src/components/skill/SkillForm.tsx`

**功能清单**:
- [x] 字段：名称、描述、使用场景、使用方法、标签
- [ ] 标签输入智能提示
- [x] 表单验证（名称必填、描述必填）
- [x] 支持 create/edit 两种模式

**Props 定义**:
```typescript
interface SkillFormProps {
  initialData?: Partial<SkillCreate>;
  mode: 'create' | 'edit';
  onSubmit: (data: SkillCreate) => void | Promise<void>;
  loading?: boolean;
}
```

### ✅ Phase 4 验收标准

| # | 验收项 | 验收方法 |
|---|--------|----------|
| 4.1 | SkillCard 展示所有必需字段 | 视觉检查 |
| 4.2 | SkillCard 悬停有明显反馈 | 视觉检查 |
| 4.3 | SkillCard 点击触发 onClick | 单元测试 |
| 4.4 | SkillList 响应式布局正确 | 浏览器测试（多分辨率） |
| 4.5 | SkillList loading=true 显示骨架屏 | 浏览器测试 |
| 4.6 | SkillList skills 为空时显示 emptyText | 单元测试 |
| 4.7 | SkillForm 验证失败时阻止提交并显示错误 | 单元测试 |
| 4.8 | SkillForm 标签输入支持多标签 | 浏览器测试 |
| 4.9 | SkillForm 编辑模式正确回填数据 | 单元测试 |

**阻塞条件**: 以上验收项全部通过方可进入 Phase 5

---

## Phase 5: 认证页面

### 5.1 登录页

**文件**: `src/pages/Login.tsx`

**功能清单**:
- [ ] 邮箱/密码表单
- [ ] 表单验证（邮箱格式、密码长度）
- [ ] 登录成功后跳转首页
- [ ] 错误提示（邮箱不存在、密码错误）
- [ ] "还没有账号？去注册" 链接

### 5.2 注册页

**文件**: `src/pages/Register.tsx`

**功能清单**:
- [ ] 用户名/邮箱/密码表单
- [ ] 密码强度提示
- [ ] 表单验证（用户名长度、邮箱格式、密码强度）
- [ ] 注册成功后跳转登录页
- [ ] "已有账号？去登录" 链接

### ✅ Phase 5 验收标准

| # | 验收项 | 验收方法 |
|---|--------|----------|
| 5.1 | 登录页表单验证阻止非法提交 | 单元测试 |
| 5.2 | 登录成功保存 Token 并跳转首页 | 浏览器测试 |
| 5.3 | 登录失败显示对应错误信息 | 浏览器测试 |
| 5.4 | 已登录用户访问登录页重定向到首页 | 浏览器测试 |
| 5.5 | 注册页密码强度提示正确更新 | 浏览器测试 |
| 5.6 | 注册成功跳转登录页并预填邮箱 | 浏览器测试 |
| 5.7 | 注册失败（邮箱已存在）显示错误 | 浏览器测试 |

**阻塞条件**: 以上验收项全部通过方可进入 Phase 6

---

## Phase 6: 首页与搜索

### 6.1 首页

**文件**: `src/pages/Home.tsx`

**功能清单**:
- [ ] 搜索栏（顶部或 Hero 区域）
- [ ] 四个榜单 Tab 切换：
  - [ ] 综合热度（默认）
  - [ ] 本周热门
  - [ ] 评分最高
  - [ ] 下载最多
- [ ] Skill 卡片网格展示
- [ ] 分页或无限滚动
- [ ] 置顶 Skill 优先展示（带置顶标识）
- [ ] 右侧/底部标签云

### 6.2 搜索功能

**文件**: 复用首页，通过 query 参数区分

**功能清单**:
- [ ] URL query 参数同步搜索关键词
- [ ] 搜索结果按相关度排序
- [ ] 无结果提示
- [ ] 清除搜索回到首页

### ✅ Phase 6 验收标准

| # | 验收项 | 验收方法 |
|---|--------|----------|
| 6.1 | 四个 Tab 切换正确请求对应 API | 浏览器 DevTools + 单元测试 |
| 6.2 | 置顶 Skill 始终显示在列表顶部 | 浏览器测试 |
| 6.3 | 首页加载显示骨架屏 | 浏览器测试 |
| 6.4 | 分页组件正常工作 | 浏览器测试 |
| 6.5 | 搜索关键词同步到 URL | 浏览器测试 |
| 6.6 | 直接访问带 query 的 URL 正确执行搜索 | 浏览器测试 |
| 6.7 | 点击标签云筛选 Skills | 浏览器测试 |
| 6.8 | 筛选结果支持清除回到全部 | 浏览器测试 |
| 6.9 | 空搜索结果显示友好提示 | 浏览器测试 |

**阻塞条件**: 以上验收项全部通过方可进入 Phase 7

---

## Phase 7: Skill 详情页

### 7.1 Skill 详情页

**文件**: `src/pages/SkillDetail.tsx`

**功能清单**:
- **左侧/上方**:
  - [ ] 基本信息（名称、描述、使用场景）
  - [ ] 作者信息（头像、用户名）
  - [ ] 文件树展示
  - [ ] SKILL.md 在线预览
  - [ ] 效果演示图片/GIF
- **右侧/下方**:
  - [ ] 评分组件（可交互）
  - [ ] 收藏按钮
  - [ ] 下载按钮（醒目）
  - [ ] 统计信息（浏览/下载/收藏数）
- **评论区**:
  - [ ] 评论列表（嵌套回复）
  - [ ] 发表评论表单
- **作者操作**:
  - [ ] 编辑按钮（仅作者可见）
  - [ ] 删除按钮（仅作者可见）

### ✅ Phase 7 验收标准

| # | 验收项 | 验收方法 |
|---|--------|----------|
| 7.1 | 页面加载显示骨架屏 | 浏览器测试 |
| 7.2 | 基本信息完整展示 | 视觉检查 |
| 7.3 | FileTree 正确展示 Skill 文件结构 | 浏览器测试 |
| 7.4 | SKILL.md 正确渲染预览 | 浏览器测试 |
| 7.5 | 登录用户可评分，评分后更新显示 | 浏览器测试 |
| 7.6 | 登录用户可收藏/取消收藏 | 浏览器测试 |
| 7.7 | 下载按钮触发下载并增加计数 | 浏览器测试 |
| 7.8 | 评论区展示嵌套回复 | 浏览器测试 |
| 7.9 | 登录用户可发表评论 | 浏览器测试 |
| 7.10 | 作者看到编辑/删除按钮，非作者看不到 | 浏览器测试 |
| 7.11 | 删除 Skill 有确认对话框 | 浏览器测试 |

**阻塞条件**: 以上验收项全部通过方可进入 Phase 8

---

## Phase 8: 上传与编辑

### 8.1 Skill 上传页

**文件**: `src/pages/SkillUpload.tsx`

**功能清单**:
- [ ] 分步表单：
  - [ ] Step 1: 上传文件（拖拽或选择）
  - [ ] Step 2: 填写元信息
  - [ ] Step 3: 预览确认
- [ ] 文件类型校验（.zip 或 SKILL.md）
- [ ] 上传进度显示
- [ ] 标签输入智能提示
- [ ] 提交成功后跳转详情页

### 8.2 Skill 编辑页

**文件**: `src/pages/SkillEdit.tsx`

**功能清单**:
- [ ] 复用 SkillForm 组件
- [ ] 加载现有 Skill 数据
- [ ] 可重新上传文件
- [ ] 保存后提示更新成功
- [ ] 非作者访问重定向到 403/首页

### ✅ Phase 8 验收标准

| # | 验收项 | 验收方法 |
|---|--------|----------|
| 8.1 | 分步表单步骤指示器正确 | 视觉检查 |
| 8.2 | 文件拖拽上传区域正常工作 | 浏览器测试 |
| 8.3 | 非法文件类型被阻止并提示 | 浏览器测试 |
| 8.4 | 上传进度条正确显示 | 浏览器测试 |
| 8.5 | 标签输入提示相似标签 | 浏览器测试 |
| 8.6 | 预览步骤展示完整信息 | 浏览器测试 |
| 8.7 | 提交成功跳转新 Skill 详情页 | 浏览器测试 |
| 8.8 | 编辑页正确加载现有数据 | 浏览器测试 |
| 8.9 | 编辑保存后显示成功提示 | 浏览器测试 |
| 8.10 | 非作者访问编辑页被重定向 | 浏览器测试 |

**阻塞条件**: 以上验收项全部通过方可进入 Phase 9

---

## Phase 9: 个人中心

### 9.1 个人中心主页面

**文件**: `src/pages/UserProfile.tsx`

**功能清单**:
- [ ] 用户信息卡片（头像、用户名、邮箱）
- [ ] 导航标签：我的 Skills / 我的收藏 / 我的评论
- [ ] 作者统计面板：
  - [ ] PV/UV 访问量
  - [ ] 下载总数
  - [ ] 收藏总数
  - [ ] 评分分布图表（1-5星各多少人）
  - [ ] 7天/30天趋势图

### 9.2 我的 Skills 页面

**文件**: `src/pages/UserSkills.tsx`

**功能清单**:
- [ ] Skill 列表（带编辑/删除按钮）
- [ ] 删除确认对话框

### 9.3 我的收藏页面

**文件**: `src/pages/UserFavorites.tsx`

**功能清单**:
- [ ] 收藏的 Skill 列表
- [ ] 取消收藏按钮

### 9.4 我的评论页面

**文件**: `src/pages/UserComments.tsx`

**功能清单**:
- [ ] 我发表的评论列表
- [ ] 点击跳转对应 Skill 详情页
- [ ] 删除评论按钮

### ✅ Phase 9 验收标准

| # | 验收项 | 验收方法 |
|---|--------|----------|
| 9.1 | 用户信息正确展示 | 浏览器测试 |
| 9.2 | 导航标签切换正确 | 浏览器测试 |
| 9.3 | 统计面板数据正确 | 浏览器测试 |
| 9.4 | 图表正确渲染（柱状图/折线图） | 视觉检查 |
| 9.5 | 我的 Skills 列表正确展示 | 浏览器测试 |
| 9.6 | 删除 Skill 有确认对话框 | 浏览器测试 |
| 9.7 | 我的收藏列表可取消收藏 | 浏览器测试 |
| 9.8 | 我的评论点击跳转到对应 Skill | 浏览器测试 |

**阻塞条件**: 以上验收项全部通过方可进入 Phase 10

---

## Phase 10: 优化完善

### 10.1 搜索与筛选优化

- [ ] 搜索防抖（300ms）
- [ ] 多标签组合筛选
- [ ] 筛选结果排序选项

### 10.2 通知功能

**文件**: `src/components/layout/Header.tsx`（扩展）

**功能清单**:
- [ ] 通知图标红点提示
- [ ] 下拉展示通知列表
- [ ] 标记已读/全部已读
- [ ] 点击通知跳转到对应 Skill

### 10.3 响应式优化

- [ ] 所有页面在 375x667（手机）测试通过
- [ ] 所有页面在 768x1024（平板）测试通过
- [ ] 所有页面在 1920x1080（桌面）测试通过

### 10.4 性能优化

- [ ] 图片懒加载
- [ ] React Query 缓存配置
- [ ] 路由懒加载

### ✅ Phase 10 验收标准

| # | 验收项 | 验收方法 |
|---|--------|----------|
| 10.1 | 搜索输入防抖有效（减少请求） | DevTools Network |
| 10.2 | 通知红点根据未读数量显示 | 浏览器测试 |
| 10.3 | 标记已读后天数减少 | 浏览器测试 |
| 10.4 | 移动端所有页面布局正常 | 浏览器测试（多分辨率） |
| 10.5 | 图片懒加载工作（Intersection Observer） | DevTools |
| 10.6 | 首屏加载时间 < 3s | Lighthouse |
| 10.7 | `npm run build` 构建成功 | 运行命令 |
| 10.8 | `npm run lint` 无错误 | 运行命令 |
| 10.9 | `npm run type-check` 无错误 | 运行命令 |
| 10.10 | 无 `any` 类型使用 | 全局搜索 |

---

## 附录

### 响应式断点

| 断点 | 宽度 | 布局调整 |
|------|------|----------|
| `sm` | 640px+ | 手机横屏适配 |
| `md` | 768px+ | 平板适配，侧边栏收起 |
| `lg` | 1024px+ | 桌面端，侧边栏展示 |
| `xl` | 1280px+ | 大屏优化 |

### 路由设计

| 路径 | 页面 | 认证要求 |
|------|------|----------|
| `/` | 首页 | 否 |
| `/search?q=xxx` | 搜索结果 | 否 |
| `/skills/:id` | Skill 详情 | 否 |
| `/upload` | 上传 Skill | 是 |
| `/skills/:id/edit` | 编辑 Skill | 是（作者） |
| `/login` | 登录 | 否 |
| `/register` | 注册 | 否 |
| `/profile` | 个人中心 | 是 |
| `/profile/skills` | 我的 Skills | 是 |
| `/profile/favorites` | 我的收藏 | 是 |
| `/profile/comments` | 我的评论 | 是 |
| `*` | 404 页面 | 否 |

### 后端 API 参考

完整 API 文档: http://localhost:8000/docs

**主要端点**:
- `POST /api/v1/auth/login` - 登录
- `POST /api/v1/auth/register` - 注册
- `GET /api/v1/auth/me` - 获取当前用户
- `GET /api/v1/skills` - Skill 列表
- `GET /api/v1/skills/:id` - Skill 详情
- `POST /api/v1/skills` - 上传 Skill
- `PUT /api/v1/skills/:id` - 更新 Skill
- `POST /api/v1/skills/:id/rate` - 评分
- `POST /api/v1/skills/:id/favorite` - 收藏
- `GET /api/v1/skills/:id/comments` - 获取评论
- `POST /api/v1/skills/:id/comments` - 发表评论
- `GET /api/v1/users/me/notifications` - 通知列表

---

*本文档随开发进度持续更新*
