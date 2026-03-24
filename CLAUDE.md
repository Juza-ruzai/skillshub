# OpenClaw Project - 核心编程规范

## 技术栈
### 后端
- Python 3.11+、FastAPI、SQLModel（异步模式）、Pydantic、Ruff、Mypy
### 前端
- React 18+、Vite、TypeScript 5+、Tailwind CSS、shadcn/ui、Lucide React

## 核心原则
### 1. 类型优先
- 禁止使用 `any`（TS）/ 未标注类型（Python）
- 所有函数、组件、数据模型必须显式定义类型
### 2. 纯函数 & 不可变性
- 核心业务逻辑使用纯函数（输入→输出无副作用）
- 避免直接修改对象/数组，返回新值（TS 用扩展运算符，Python 用不可变默认值）
### 3. 分层设计
- 后端：路由 → 服务层 → 模型（禁止路由直接操作数据库）
- 前端：组件 → Hooks → API 客户端（禁止组件内直接写请求逻辑）

## 命名规范
| 类型         | Python 规范       | TypeScript/React 规范 |
|--------------|-------------------|-----------------------|
| 变量/函数    | snake_case        | camelCase             |
| 常量         | UPPER_SNAKE_CASE  | UPPER_SNAKE_CASE      |
| 类/接口/组件 | PascalCase        | PascalCase            |
| 模块/文件    | snake_case        | kebab-case            |
| 布尔变量     | is/has/should + 名词 | is/has/should + 名词  |
| 私有属性     | _前缀             | _前缀                 |

## 文档反向同步规范 
**核心原则**：代码即真理，文档必须紧随代码演进。`PRD.md` 和 `ARCHITECTURE.md` 是“活文档”(Living Documents)，决不允许代码与文档脱节产生“架构漂移”。
**触发条件**：
在开发过程中，如果发生以下任意级别的变更，你必须主动执行文档反向同步：
1. **数据模型变更**：修改了核心的数据库表结构、字段，或者调整了后端的 Pydantic 数据验证模型。
2. **契约与路由变更**：新增、删减或修改了核心 API 路由，或前端页面路由映射发生了改变。
3. **技术栈与中间件**：引入了新的核心技术组件（例如：新增了 Redis 缓存策略、接入了新的第三方 SDK、修改了核心鉴权机制）。
4. **业务流妥协**：由于技术实现难度或逻辑漏洞，实际开发中的业务流偏离了 `PRD.md` 的初始设定或用例。
**执行动作**：
- 当触发上述条件时，你必须在当前子任务完成（并在 git commit 之前），主动静默修改并覆写 `ARCHITECTURE.md` 或 `PRD.md` 中对应的陈旧章节，其他部分严格保持不变，使其与当前代码现状保持绝对一致。
- 同步完成后，你必须在向我汇报，明确提醒

## 开发方法
### 后端开发
使用superpowers 的 test-driven-development 技能进行开发
1.告诉我准备了哪些测试用例，是否考虑边界条件？
2.完成验收标准，全部完成后给我汇报
### 前端开发
采用"开发一个页面 → 验收一个页面 → 确认后再继续"的方式，确保每一步都符合 Design.md规范。
1.开发页面前，你先和我说一下这个页面的开发计划，大致的页面是如何设计的？我需要确认你的想法是否符合我的意图
2.开发页面后，使用dev-browser进行验证
### 前后端联调测试
1.可以使用fastapi的openapi.json查看精准接口文档
2.先测试核心路径（API 返回正确性），再测 UI 交互  
3.如果存在问题，需要修复BUG
 - 使用superpowers 的 superpowers:systematic-debugging 技能进行修复
 - 修复后需要进行验证，确保修复成功
### 联动修改规范
- 修改任何字段类型、函数签名、接口定义前，必须先 Grep 全局搜索所有引用位置
- 后端字段类型变更时，必须同步检查：models/、schemas/、services/（一次改完，不允许分轮修复）
- 前端类型变更时，必须同步检查：types/、相关组件、API 客户端函数
- 修改顺序：Grep 确认所有位置 → 一次性全改 → 再测试

## 进度控制
带有checkbox的进度控制类文档，例如PROGRESS.md和TEST_CHECKLIST.md，当完成对应任务后需要自主自动更新进度类文档，时刻保持文档处于最新状态

## 热重载规范
- 后端使用 uvicorn `--reload`，**禁止** 擅自 kill Python 进程后重启
- 改代码后若行为未变，处理顺序：
  1. 等待终端出现日志（等 3s）
  2. 无日志 → `touch backend/app/main.py` 强制触发全量重载
  3. 确认只有一个 Python 进程在跑：`powershell -Command "Get-Process -Name python"`
  4. 以上均无效，才允许重启（重启前必须先告知用户）

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

## Windows 终端进程操作规范
### 终端命令规范
- Bash tool 运行在 Git Bash 中，`/F`、`/PID` 等参数会被转义为盘符路径，**禁止在 Git Bash 直接使用 taskkill**
- Windows 原生命令统一通过 PowerShell 调用：
```bash
powershell -Command "Get-Process -Name python | Stop-Process -Force"
powershell -Command "netstat -ano | findstr :8000"
```
### 启动服务器
- 前端默认端口：**5173**（`cd frontend && npm run dev`）
- 后端默认端口：**8000**（`cd backend && python -m app.main`）
- 启动前先确认端口未被占用，**不允许自动换端口**，如有占用先关闭被占用的端口

## Git 提交规范
### 提交时机（原子化提交）
- 每个独立 Bug 修复完成或者一个子功能开发后立即 commit
- 每个功能子步骤完成后 commit
- 每轮对话结束前必须 commit，不留 dirty 状态跨会话
### 提交格式
<type>(<scope>): <subject>
- 类型：feat(新功能)、fix(修复)、docs(文档)、refactor(重构)、test(测试)、chore(构建)
- 内容：用中文描述
- 修复bug时必填：根因：XXX 修复：XXX 