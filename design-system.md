# OpenClaw Skills Hub - 设计系统文档

> 版本：v1.0
> 日期：2026-03-18
> 设计方向：科技感 + 未来感 + 玻璃拟态

---

## 1. 设计概述

### 1.1 设计理念
- **核心风格**：科技感、未来感、专业稳重
- **视觉语言**：玻璃拟态 (Glassmorphism) + 柔和渐变
- **情感传达**：专业可信、现代清爽、高效智能

### 1.2 双主题策略
| 主题 | 名称 | 适用场景 | 氛围 |
|------|------|----------|------|
| 白天模式 | 深海蓝晶 | 默认、日间使用 | 专业、清爽、明亮 |
| 夜间模式 | 午夜深蓝 | 晚间、护眼需求 | 沉浸、科技、深邃 |

---

## 2. 色彩系统

### 2.1 CSS 变量定义

```css
:root {
  /* ===== 白天模式 - 深海蓝晶 ===== */

  /* 背景 */
  --bg-primary: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 30%, #dbeafe 70%, #ede9fe 100%);
  --bg-glow-1: rgba(59,130,246,0.15);
  --bg-glow-2: rgba(6,182,212,0.12);
  --bg-glow-3: rgba(99,102,241,0.1);

  /* 卡片 */
  --card-bg: rgba(255, 255, 255, 0.85);
  --card-border: rgba(255, 255, 255, 0.6);
  --card-shadow: 0 8px 32px rgba(59, 130, 246, 0.08);

  /* 导航栏 */
  --navbar-bg: rgba(255, 255, 255, 0.75);
  --navbar-border: rgba(255, 255, 255, 0.6);

  /* 文字 */
  --text-primary: #1e293b;      /* 标题、重要文字 */
  --text-secondary: #64748b;    /* 次要文字、标签 */
  --text-tertiary: #94a3b8;     /* 占位符、禁用文字 */

  /* 强调色 */
  --accent-primary: #3b82f6;    /* 主色：亮蓝 */
  --accent-secondary: #06b6d4;  /* 辅色：青色 */

  /* 按钮渐变 */
  --btn-gradient: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  --stat-gradient: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);

  /* 辅助 */
  --ring-bg: #e2e8f0;
  --tab-active-bg: rgba(255, 255, 255, 0.9);
  --tab-active-border: rgba(59, 130, 246, 0.15);
}

[data-theme="dark"] {
  /* ===== 夜间模式 - 午夜深蓝 ===== */

  /* 背景 */
  --bg-primary: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  --bg-glow-1: rgba(59,130,246,0.25);
  --bg-glow-2: rgba(6,182,212,0.2);
  --bg-glow-3: rgba(99,102,241,0.15);

  /* 卡片 */
  --card-bg: rgba(30, 41, 59, 0.8);
  --card-border: rgba(255, 255, 255, 0.1);
  --card-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  /* 导航栏 */
  --navbar-bg: rgba(15, 23, 42, 0.85);
  --navbar-border: rgba(255, 255, 255, 0.1);

  /* 文字 */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;

  /* 强调色 */
  --accent-primary: #60a5fa;    /* 更亮的蓝 */
  --accent-secondary: #34d399;  /* 翠绿 */

  /* 按钮渐变 */
  --btn-gradient: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  --stat-gradient: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);

  /* 辅助 */
  --ring-bg: #334155;
  --tab-active-bg: rgba(59, 130, 246, 0.2);
  --tab-active-border: rgba(59, 130, 246, 0.3);
}
```

### 2.2 色板速查

| 用途 | 白天模式 | 夜间模式 |
|------|----------|----------|
| 页面背景 | #f0f9ff → #e0f2fe → #dbeafe → #ede9fe | #0f172a → #1e293b → #0f172a |
| 卡片背景 | rgba(255,255,255,0.85) | rgba(30,41,59,0.8) |
| 卡片边框 | rgba(255,255,255,0.6) | rgba(255,255,255,0.1) |
| 主文字 | #1e293b | #f1f5f9 |
| 次文字 | #64748b | #94a3b8 |
| 主强调色 | #3b82f6 | #60a5fa |
| 辅强调色 | #06b6d4 | #34d399 |

---

## 3. 字体系统

### 3.1 字体栈
```css
/* 标题字体 */
font-family: 'Space Grotesk', 'Noto Sans SC', sans-serif;

/* 正文字体 */
font-family: 'Inter', 'Noto Sans SC', sans-serif;
```

### 3.2 字体加载
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### 3.3 字号规范

| 元素 | 字号 | 字重 | 行高 | 备注 |
|------|------|------|------|------|
| Slogan | 52px | 700 | 1.2 | 移动端: 36px |
| 副标题 | 17px | 400 | 1.5 | --text-secondary |
| 卡片标题 | 14px | 600 | 1.4 | --text-primary |
| 卡片元信息 | 12px | 400 | 1.5 | --text-secondary |
| 导航链接 | 14px | 500 | 1 | --text-secondary |
| Logo | 22px | 700 | 1 | 渐变色 |
| 统计数字 | 22px | 700 | 1 | 渐变色 |
| 统计标签 | 13px | 400 | 1 | --text-secondary |
| 按钮文字 | 14px | 600 | 1 | 白色 |

---

## 4. 布局系统

### 4.1 页面结构

```
┌─────────────────────────────────────────┐
│  导航栏 (固定顶部, 70px高)                │
├─────────────────────────────────────────┤
│                                         │
│  Hero Section                           │
│  ├─ Slogan                              │
│  ├─ 副标题                               │
│  ├─ 统计卡片 (3列, 环形进度)              │
│  ├─ 搜索框                               │
│  └─ Tab 切换                             │
│                                         │
│  Skills Grid (响应式瀑布流)              │
│  ├─ Skill Card × N                      │
│                                         │
└─────────────────────────────────────────┘
```

### 4.2 间距规范

| 元素 | 间距 |
|------|------|
| 页面内边距 | 40px (桌面) / 20px (移动) |
| Hero 上下间距 | 60px 上, 40px 下 |
| 统计卡片间距 | 48px |
| 卡片网格间距 | 20px |
| 导航栏内边距 | 16px 40px |

### 4.3 响应式断点

| 断点 | 宽度 | 布局调整 |
|------|------|----------|
| 桌面 | ≥1024px | 4列卡片网格 |
| 平板 | 768-1023px | 2-3列网格 |
| 移动 | <768px | 单列网格, 简化导航 |

---

## 5. 组件规范

### 5.1 导航栏

```css
.navbar {
  background: var(--navbar-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--navbar-border);
  padding: 16px 40px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
```

**内容布局**：Logo (左) | 导航链接 (中) | 主题切换 + 头像 (右)

### 5.2 统计卡片（环形进度）

```css
.stat-ring {
  width: 90px;
  height: 90px;
  position: relative;
}

.stat-ring-bg {
  fill: none;
  stroke: var(--ring-bg);
  stroke-width: 6;
}

.stat-ring-fill {
  fill: none;
  stroke: url(#statGradient); /* 渐变色 */
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 251;
  stroke-dashoffset: 60; /* 约75%进度 */
}
```

**SVG 渐变定义**：
```html
<linearGradient id="statGradient" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%" stop-color="var(--accent-primary)" />
  <stop offset="100%" stop-color="var(--accent-secondary)" />
</linearGradient>
```

### 5.3 搜索框

```css
.search-box {
  max-width: 560px;
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 5px;
  box-shadow: var(--card-shadow);
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 16px;
  font-size: 15px;
  color: var(--text-primary);
}
```

### 5.4 Skill 卡片

```css
.skill-card {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: all 0.4s ease;
  cursor: pointer;
}

.skill-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(59, 130, 246, 0.15);
}

.skill-card-image {
  height: 120px;
  background: linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(6,182,212,0.08) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}
```

### 5.5 Tab 切换

```css
.tab {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  background: rgba(59, 130, 246, 0.08);
  color: var(--accent-primary);
}

.tab.active {
  background: var(--tab-active-bg);
  color: var(--accent-primary);
  border: 1px solid var(--tab-active-border);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
}
```

### 5.6 主题切换按钮

```css
.theme-toggle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: var(--card-shadow);
}

/* 图标切换动画 */
.theme-toggle .icon-sun,
.theme-toggle .icon-moon {
  position: absolute;
  transition: all 0.3s ease;
}

.theme-toggle .icon-sun {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.theme-toggle .icon-moon {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

[data-theme="dark"] .theme-toggle .icon-sun {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

[data-theme="dark"] .theme-toggle .icon-moon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}
```

### 5.7 主按钮

```css
.btn-primary {
  background: var(--btn-gradient);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}
```

---

## 6. 动效规范

### 6.1 过渡时间

| 动效类型 | 时长 | 缓动函数 |
|----------|------|----------|
| 主题切换 | 0.5s | ease |
| 卡片悬浮 | 0.4s | ease |
| 按钮悬浮 | 0.3s | ease |
| Tab 切换 | 0.2s | ease |
| 图标切换 | 0.3s | ease |

### 6.2 背景光晕动画

```css
@keyframes bgPulse {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.02); }
}

body::before {
  animation: bgPulse 12s ease-in-out infinite;
}
```

### 6.3 卡片悬浮效果

```css
.skill-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.skill-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(59, 130, 246, 0.15);
}
```

---

## 7. 首页内容规范

### 7.1 Slogan
- **文字**：汇集中建智慧
- **字体**：Space Grotesk + Noto Sans SC
- **字号**：52px (桌面) / 36px (移动)
- **字重**：700
- **颜色**：var(--text-primary)

### 7.2 副标题
- **文字**：发现、分享和复用 AI Skills，让工作效率倍增
- **字号**：17px
- **颜色**：var(--text-secondary)

### 7.3 统计数据

| 统计项 | 数值 | 标签 |
|--------|------|------|
| AI Skills | 128 | AI Skills |
| 总下载 | 2.4k | 总下载 |
| 活跃用户 | 48 | 活跃用户 |

**展示形式**：环形进度条（约75%填充）+ 中心数字 + 底部标签

### 7.4 Tab 选项
- 综合热度（默认选中）
- 本周热门
- 评分最高
- 下载最多

---

## 8. 主题切换实现

### 8.1 HTML 结构
```html
<body>
  <!-- 内容 -->
  <button class="theme-toggle" onclick="toggleTheme()">
    <span class="icon-sun">☀️</span>
    <span class="icon-moon">🌙</span>
  </button>
</body>
```

### 8.2 JavaScript 实现
```javascript
// 初始化主题
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
  }
}

// 切换主题
function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initTheme);
```

### 8.3 系统主题检测（可选）
```javascript
// 检测系统偏好
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.setAttribute('data-theme', 'dark');
}

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  if (event.matches) {
    document.body.setAttribute('data-theme', 'dark');
  } else {
    document.body.removeAttribute('data-theme');
  }
});
```

---

## 9. 响应式适配

### 9.1 移动端调整

```css
@media (max-width: 768px) {
  .navbar {
    padding: 12px 20px;
  }

  .nav-center {
    display: none; /* 移动端隐藏导航链接 */
  }

  .page-content {
    padding: 24px 20px;
  }

  .slogan {
    font-size: 36px;
  }

  .stats-row {
    gap: 24px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 10. 设计原则总结

1. **玻璃拟态**：所有卡片使用半透明背景 + backdrop-filter 模糊
2. **渐变流动**：背景使用大面积柔和渐变 + 动态光晕
3. **双主题一致**：白天/夜间使用相同的组件结构，仅颜色变化
4. **微交互**：每个可交互元素都有悬浮/点击反馈
5. **层次清晰**：通过阴影、边框、背景色建立清晰的视觉层次

---

## 参考文件

- 双主题演示：`/playground/theme-toggle-system.html`
- 背景对比：`/playground/background-comparison.html`
- 完整页面设计：`/playground/photon-design-system.html`
