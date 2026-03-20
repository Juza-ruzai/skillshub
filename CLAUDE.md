# OpenClaw Project - 核心编程规范


## 技术栈
### 后端
- Python 3.11+、FastAPI、SQLModel（异步模式）、Pydantic、Ruff、Mypy
### 前端
- React 18+、Vite、TypeScript 5+、Tailwind CSS、shadcn/ui、Lucide React


## 核心原则（必须遵守）
### 1. 类型优先
- 禁止使用 `any`（TS）/ 未标注类型（Python）
- 所有函数、组件、数据模型必须显式定义类型

### 2. 纯函数 & 不可变性
- 核心业务逻辑使用纯函数（输入→输出无副作用）
- 避免直接修改对象/数组，返回新值（TS 用扩展运算符，Python 用不可变默认值）

### 3. 分层设计
- 后端：路由 → 服务层 → 模型（禁止路由直接操作数据库）
- 前端：组件 → Hooks → API 客户端（禁止组件内直接写请求逻辑）

## 命名规范（核心）
| 类型         | Python 规范       | TypeScript/React 规范 |
|--------------|-------------------|-----------------------|
| 变量/函数    | snake_case        | camelCase             |
| 常量         | UPPER_SNAKE_CASE  | UPPER_SNAKE_CASE      |
| 类/接口/组件 | PascalCase        | PascalCase            |
| 模块/文件    | snake_case        | kebab-case            |
| 布尔变量     | is/has/should + 名词 | is/has/should + 名词  |
| 私有属性     | _前缀             | _前缀                 |


## 项目结构
project/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI 入口
│   │   ├── core/            # 配置/数据库/异常
│   │   ├── models/          # SQLModel 模型
│   │   ├── schemas/         # Pydantic 校验
│   │   ├── api/             # 路由
│   │   ├── services/        # 业务逻辑
│   │   └── utils/           # 工具函数
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/      # 通用/功能组件
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── lib/             # API/工具函数
│   │   ├── types/           # 类型定义
│   │   └── pages/           # 页面组件


## 代码质量要求

### 后端
运行以下命令无错误：
```bash
ruff check app
ruff format app --check
mypy app
```
- 测试覆盖率 ≥ 80%
- 提交前必须运行 `ruff format app` 格式化代码

### 前端
运行以下命令无错误：
```bash
npm run lint        # ESLint 检查（包含 Prettier 规则）
npm run format:check # Prettier 格式检查
npm run type-check   # TypeScript 类型检查
```

**可用的代码质量命令：**
| 命令 | 说明 |
|------|------|
| `npm run lint` | 检查 ESLint 和 Prettier 规则 |
| `npm run lint:fix` | 自动修复 ESLint 和 Prettier 问题 |
| `npm run format` | 使用 Prettier 格式化代码 |
| `npm run format:check` | 检查代码格式（CI 使用） |
| `npm run type-check` | TypeScript 类型检查 |

**代码风格配置：**
- ESLint 配置：`eslint.config.js`（包含 typescript-eslint, react-hooks, prettier）
- Prettier 配置：`.prettierrc`（无分号、单引号、2空格缩进、printWidth: 100）
- 禁止硬编码颜色（使用 shadcn CSS 变量）

**提交前必须执行：**
```bash
npm run lint:fix && npm run type-check
```
## 前后端API调试
使用fastapi的openapi.json查看精准接口文档

## Git 提交规范（精简）
<type>(<scope>): <subject>
类型：feat(新功能)、fix(修复)、docs(文档)、refactor(重构)、test(测试)、chore(构建)

## Windows 环境操作规范（必须遵守）

### 进程/端口管理
- **禁止**使用 bash 的 `kill` 命令杀 Windows 进程，bash 的 kill 对 Windows PID 无效
- 查端口占用：`netstat -ano | grep :PORT`（bash）或 `netstat -ano | findstr :PORT`（PowerShell）
- 杀进程：只能在 PowerShell/CMD 中执行 `taskkill /f /pid <PID>`，不要在 bash 中尝试
- 如需关闭端口，**直接告知用户执行** `taskkill /f /pid <PID>`，不要自己尝试

### 开发服务器
- 前端默认端口：**5173**（`cd frontend && npm run dev`）
- 后端默认端口：**8000**（`cd backend && python -m app.main`）
- 启动前先确认端口未被占用，**不允许自动换端口**，如有占用先关闭被占用的端口