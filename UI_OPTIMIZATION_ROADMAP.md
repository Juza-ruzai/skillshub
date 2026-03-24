# OpenClaw Skills Hub - UI 优化路线图

> 版本：v1.0
> 创建日期：2026-03-24
> 最后更新：2026-03-24
> 状态：进行中

---

## 设计上下文

**品牌定位**：专业可靠 · 简洁高效 · 科技感

**核心原则**：
1. 专业可靠 - 界面整洁，交互可预期
2. 简洁高效 - 减少认知负担，核心操作一目了然
3. 科技感但不花哨 - 精准蓝色调，微妙动效
4. 一致性 - 统一组件语言和交互模式
5. 独特性 - 避免 AI 千篇一律风格

**反模式（避免）**：
- ❌ 玻璃拟态滥用
- ❌ 渐变文字滥用
- ❌ 千篇一律的卡片布局
- ❌ Hero 大数字 + 小标签

---

## 优化阶段总览

| 阶段 | 目标 | 涉及页面/组件 | 预计工作量 |
|------|------|--------------|-----------|
| **Phase 0** | 设计系统重构 | index.css、tailwind.config.js | 中 |
| **Phase 1** | 核心页面重设计 | Home、Header、SkillCard | 高 |
| **Phase 2** | 详情页优化 | SkillDetail | 中 |
| **Phase 3** | 用户流程优化 | Login、Register、Profile 系列 | 中 |
| **Phase 4** | 管理后台优化 | Admin 系列 | 低 |
| **Phase 5** | 全局打磨 | 动效、细节、响应式 | 低 |

---

## 工作模式
1. 阶段性确认：每完成一个 Phase 后，暂停让我验收，再继续下一阶段  
2. 预览验证：涉及具体页面时，开发完后用 dev-browser 确认
3. 设计决策确认：重大设计变更前先询问我
4. 并行任务：如果有多个独立任务，可以并行同时进行      
建议的交互流程：
你: 开始 Phase X
我: [执行] → 完成后验证 → 简洁汇报
你: 确认/修改意见
我: 调整 → 继续

---

## Playwright使用规范
1. 批量执行优先    
用 browser_run_code 将多个测试步骤合并为单次调用，返回结构化结果对象，避免逐步交互。批量代码需要注意导航操作后不能直接用 page.evaluate，需要waitForNavigation 或拆开。
1. 尽量少用截图作为验证手段 
browser_take_screenshot 极耗token（图片编码），可以的话，尽量只在最终验收时留档用一次。日常验证一律用browser_evaluate 返回布尔值或文本。断言返回数据而非截图。
1. 按需使用 browser_snapshot
仅在需要获取元素 ref 进行交互、或遇到异常排查时调用，不要在每个测试步骤后都 snapshot。
1. 失败时才深入排查
批量脚本返回失败项后，只对失败项单独调用 browser_snapshot 或browser_evaluate 定位原因。 

---

## Phase 0: 设计系统重构

> **目标**：建立更精准、更有质感的设计系统，为后续页面优化打好基础

### 0.1 色彩系统重构 ✅
- [x] 定义新的蓝色主色调（更精准、更有质感）
- [x] 定义偏蓝调的中性色（替代纯灰）
- [x] 优化深色模式配色
- [x] 创建 CSS 变量文档

**技能**：`/impeccable:colorize`

### 0.2 排版系统优化 ✅
- [x] 审视字体选择（是否需要更换）
- [x] 定义更精准的字号阶梯
- [x] 优化中英文混排效果
- [x] 确保标题层级的视觉区分度

**技能**：`/impeccable:typeset`

### 0.3 间距与布局系统 ✅
- [x] 定义统一的间距系统（4px 基准）
- [x] 优化圆角系统（减少过度圆润）
- [x] 定义阴影层级

**技能**：`/impeccable:arrange`

### 0.4 组件基础样式 ✅
- [x] 重新设计按钮样式（减少渐变依赖）
- [x] 重新设计卡片样式（减少玻璃拟态）
- [x] 重新设计表单元素样式

**技能**：`/impeccable:normalize`

---

## Phase 1: 核心页面重设计

> **目标**：首页是用户的第一印象，需要展现独特的品牌调性

### 1.1 Header 导航栏 ✅
**当前问题**：
- Logo 文字使用渐变（反模式）
- 过度使用玻璃拟态效果

**优化目标**：
- [x] 简化导航栏视觉，更专业克制
- [x] 优化 Logo 展示方式
- [x] 优化用户菜单交互
- [x] 移动端适配优化

**技能**：`/impeccable:frontend-design` → `/impeccable:polish`

### 1.2 Home 首页 ✅
**当前问题**：
- Hero 区域使用环形统计图（较为普通）
- 标题使用渐变文字（反模式）
- 卡片网格布局较为常规
- 搜索框样式过于花哨

**优化目标**：
- [x] 重新设计 Hero 区域（避免大数字+小标签）
- [x] 优化标题样式（移除渐变文字）
- [x] 重新设计搜索框（更简洁专业）
- [x] 优化 Tab 切换交互
- [x] 优化统计展示方式
- [ ] 添加页面加载动效（可选）

**技能**：`/impeccable:frontend-design` → `/impeccable:animate`

### 1.3 SkillCard 组件 ✅
**当前问题**：
- 与首页卡片风格不一致
- 使用基础灰色样式，缺乏品牌感
- hover 效果过于简单

**优化目标**：
- [x] 统一卡片设计语言
- [x] 优化信息层级
- [x] 添加有意义的 hover 状态
- [x] 优化标签展示

**技能**：`/impeccable:frontend-design`

---

## Phase 2: 详情页优化

> **目标**：详情页是核心转化页面，需要清晰的信息层级和流畅的交互

### 2.1 SkillDetail 页面 ✅
**当前问题**：
- 大量使用玻璃拟态卡片
- 标题使用渐变文字
- 信息密度较高，层次不够清晰
- 右侧操作区可以更突出

**优化目标**：
- [x] 简化卡片样式，减少视觉噪音
- [x] 重新设计标题区（移除渐变）
- [x] 优化内容区信息层级
- [x] 重新设计操作区（下载、收藏、评分）
- [x] 优化评论区样式
- [x] 添加内容切换动效

**技能**：`/impeccable:arrange` → `/impeccable:clarify`

### 2.2 文件树组件 ✅
**优化目标**：
- [x] 优化文件树交互
- [x] 添加文件图标区分
- [x] 优化预览区域

**技能**：`/impeccable:polish`

---

## Phase 3: 用户流程优化

> **目标**：登录、注册、个人中心需要简洁高效

### 3.1 Login / Register 页面 ✅
**优化目标**：
- [x] 简化表单设计
- [x] 优化错误提示样式
- [x] 移除玻璃拟态效果

**技能**：`/impeccable:frontend-design`

### 3.2 UserProfile 页面 ✅
**优化目标**：
- [x] 优化用户信息展示
- [x] 重新设计 Tab 切换（纯色背景）
- [x] 统计数字改用纯色（移除渐变文字）

**技能**：`/impeccable:arrange`

### 3.3 SkillUpload / SkillEdit 页面 ✅
**优化目标**：
- [x] 优化表单布局
- [x] 优化步骤指引
- [x] 移除玻璃拟态效果

**技能**：`/impeccable:clarify`

---

## Phase 4: 管理后台优化

> **目标**：管理后台需要高效、清晰

### 4.1 AdminDashboard
**优化目标**：
- [ ] 重新设计统计卡片
- [ ] 优化数据展示

**技能**：`/impeccable:arrange`

### 4.2 AdminSkills / AdminUsers / AdminComments
**优化目标**：
- [ ] 统一表格样式
- [ ] 优化操作按钮
- [ ] 添加批量操作交互

**技能**：`/impeccable:polish`

---

## Phase 5: 全局打磨

> **目标**：确保整体一致性和细节品质

### 5.1 动效系统
- [ ] 定义页面切换动效
- [ ] 定义元素入场动效
- [ ] 定义交互反馈动效
- [ ] 添加 reduced-motion 支持

**技能**：`/impeccable:animate`

### 5.2 响应式适配
- [ ] 检查移动端所有页面
- [ ] 优化移动端交互
- [ ] 确保触摸友好

**技能**：`/impeccable:adapt`

### 5.3 细节打磨
- [ ] 统一 loading 状态
- [ ] 统一空状态设计
- [ ] 统一错误提示
- [ ] 检查所有页面的视觉一致性

**技能**：`/impeccable:polish`

### 5.4 最终审计
- [ ] 可访问性检查
- [ ] 性能检查
- [ ] 跨浏览器测试

**技能**：`/impeccable:audit`

---

## 进度追踪

| 阶段 | 状态 | 完成日期 |
|------|------|---------|
| Phase 0 | ✅ 完成 | 2026-03-24 |
| Phase 1 | ✅ 完成 | 2026-03-24 |
| Phase 2 | ✅ 完成 | 2026-03-24 |
| Phase 3 | ✅ 完成 | 2026-03-24 |
| Phase 4 | 🔲 未开始 | - |
| Phase 5 | 🔲 未开始 | - |

---

## 技能速查表

| 技能 | 用途 | 使用时机 |
|------|------|---------|
| `frontend-design` | 创建新页面/组件 | 重新设计页面时 |
| `arrange` | 改善布局、间距、视觉节奏 | 布局优化时 |
| `colorize` | 添加有策略的色彩 | 配色优化时 |
| `typeset` | 改善排版 | 字体优化时 |
| `animate` | 添加动效和微交互 | 交互动效时 |
| `polish` | 最终质量检查 | 细节打磨时 |
| `clarify` | 改善 UX 文案和流程 | 流程优化时 |
| `normalize` | 统一设计系统 | 组件统一时 |
| `adapt` | 响应式适配 | 移动端优化时 |
| `audit` | 全面审计 | 最终检查时 |
| `critique` | UX 评估 | 设计评审时 |

---

## 变更记录

| 日期 | 变更内容 |
|------|---------|
| 2026-03-24 | Phase 3 完成：Login、Register、UserProfile、SkillUpload、SkillEdit 页面优化 - 移除玻璃拟态、渐变文字，简化表单样式 |
| 2026-03-24 | Phase 1 完成：Header、Home、SkillCard 优化 - 移除渐变文字、玻璃拟态，统一设计语言 |
| 2026-03-24 | Phase 2 完成：SkillDetail 页面优化 - 移除玻璃拟态、渐变文字，优化文件树组件 |
| 2026-03-24 | 初始版本，创建优化路线图 |

---

## 🐛 已知 Bug 列表

> 优先级：🔴 高 | 🟡 中 | 🟢 低

### 🔴 高优先级

#### BUG-001: `--btn-gradient` CSS 变量未定义
- **现象**：亮色模式下登录/注册按钮不显示（背景透明 + 白色文字）
- **根因**：`--btn-gradient` 变量在 `index.css` 中未定义，但多处组件使用
- **影响范围**：Login、Register、UserProfile、SkillUpload、SkillEdit、AdminDashboard、AdminSkills、AdminUsers、AdminComments、AdminStats 等所有使用 `var(--btn-gradient)` 的按钮
- **修复方案**：在 `index.css` 的 `:root` 和 `[data-theme='dark']` 中定义 `--btn-gradient` 变量

#### BUG-002: 管理后台亮色模式下选中板块颜色不显示
- **现象**：管理后台 Tab 切换时，"正常"和"已删除"选中状态在亮色模式下不可见
- **根因**：待排查（可能与 Tab 组件的激活态颜色有关）
- **影响范围**：AdminSkills、AdminUsers、AdminComments、AdminStats
- **修复方案**：待定

#### BUG-003: 个人中心"我的评论"列表不显示
- **现象**：UserComments 页面中评论所属的 Skill 列表不显示（亮色和暗色均不显示）
- **根因**：待排查
- **影响范围**：UserComments.tsx
- **修复方案**：待定

### 🟡 中优先级

#### BUG-004: 主题切换时文字颜色缓慢过渡
- **现象**：切换主题时，所有文字颜色会有 0.2s 的过渡动画，视觉上不流畅
- **根因**：`index.css` 第 262-271 行的全局 transition 设置了 `color 0.2s ease`
- **影响范围**：全局所有文字
- **修复方案**：移除 `color` 的 transition，只保留 `background-color` 和 `border-color`

```css
/* 当前代码（有问题） */
*,
*::before,
*::after {
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.2s ease,  /* ← 移除这行 */
    box-shadow 0.3s ease;
}
```

---

*Bug 列表持续更新中，修复后请标记为 ✅ 已修复*

---

*本文档用于指导 OpenClaw Skills Hub 的前端 UI 优化工作，持续更新中。*
