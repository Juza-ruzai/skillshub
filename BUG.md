# OpenClaw Skills Hub - Bug 修复清单

> 生成时间：2026-03-21
> 更新时间：2026-03-21 19:20
> 状态：**全部已修复（Playwright 验收通过 2026-03-21）**

---

## BUG-1 【严重】`Skill` 类型字段命名与 API 不一致（camelCase vs snake_case）

- **状态**: ✅ 已修复
- **修复**: `src/types/skill.ts` 全部使用 snake_case

---

## BUG-2 【严重】搜索参数名不匹配（`q` vs `search`）

- **状态**: ✅ 已修复
- **修复**: `src/pages/Home.tsx` 中 `fetchSkills` 函数内部正确映射 `q` → `search`

---

## BUG-3 【重要】`favorite_count`（收藏数）未包含在 API 响应中

- **状态**: ✅ 已修复
- **验证**: API 返回 `favorite_count: 0` (int 类型)

---

## BUG-4 【重要】详情页 `author_username` 返回空字符串

- **状态**: ✅ 已修复
- **修复**: `backend/app/api/v1/skills.py` 第 310 行，在 `increment_view_count` commit 前保存 `author_id`
- **验证**: API 返回 `author_username: 'testuser'`

---

## BUG-5 【中等】`rating_avg` 类型不一致（列表返回 string，详情返回 float）

- **状态**: ✅ 已修复
- **验证**: API 返回 `rating_avg: 0.0` (float 类型)

---

## BUG-6 【轻微】`SkillListResponse` 分页字段名不一致

- **状态**: ✅ 已修复
- **修复**: `src/types/skill.ts` 使用 `page_size` (snake_case)

---

## BUG-7 【轻微】收藏接口响应字段名不匹配

- **状态**: ✅ 已修复
- **修复**: `src/lib/skillsApi.ts` 返回类型为 `{ is_favorited: boolean }`

---

## 修复进度总览

| Bug | 严重度 | 状态 |
|-----|--------|------|
| BUG-1 Skill 类型 camelCase/snake_case 不一致 | 🔴 严重 | ✅ 已修复 |
| BUG-2 搜索参数名不匹配 | 🔴 严重 | ✅ 已修复 |
| BUG-3 favorite_count 缺失 | 🟠 重要 | ✅ 已修复 |
| BUG-4 author_username 为空 | 🟠 重要 | ✅ 已修复 |
| BUG-5 rating_avg 类型不一致 | 🟡 中等 | ✅ 已修复 |
| BUG-6 分页字段名不一致 | 🟢 轻微 | ✅ 已修复 |
| BUG-7 收藏响应字段名不匹配 | 🟢 轻微 | ✅ 已修复 |

---

## Playwright 验收记录（2026-03-21）

| 验收项 | 期望 | 实际 | 结论 |
|--------|------|------|------|
| 首页 AI Skills 数字 | 非 "--" | **2** | ✅ |
| 首页卡片作者名 | 非 "?" | **testuser** | ✅ |
| 首页卡片评分 | float 数字 | **⭐ 0.0** | ✅ |
| 首页卡片收藏数 | 有值 | **♥ 0** | ✅ |
| 搜索「验收」 | 只返回匹配 | **1 条** | ✅ |
| 搜索不存在词 | 空结果 | **0 条** | ✅ |
| 详情页作者名 | 非 "?" | **testuser** | ✅ |
| 详情页日期 | 非 "Invalid Date" | **2026/3/20** | ✅ |
| 详情页下载按钮 | 非 "NaN undefined" | **126 B** | ✅ |
| 详情页收藏按钮点击 | 立即切换，无需刷新 | **已收藏 (1)** | ✅ |
| TypeScript 类型检查 | 零错误 | **通过** | ✅ |
