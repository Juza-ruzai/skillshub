// 类型定义统一导出

export * from './user'
export * from './skill'
export * from './comment'

// 通知类型
export interface Notification {
  id: string
  userId: string
  type: 'skill_update' | 'comment_reply'
  skillId?: string
  message: string
  isRead: boolean
  createdAt: string
}

// 通用响应类型
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  detail?: string
  message?: string
  errors?: Record<string, string[]>
}

// 分页请求参数
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  pages: number
}

// 个人中心 - 我的 Skills 条目
export interface MySkillItem {
  id: string
  name: string
  description: string
  tags: string[]
  author_id: string
  author_username: string
  download_count: number
  view_count: number
  rating_avg: string
  rating_count: number
  created_at: string
  is_deleted?: boolean
  is_pinned?: boolean
}

// 个人中心 - 我的评论条目（含 skill_name）
export interface MyCommentItem {
  id: string
  skill_id: string
  skill_name: string
  user_id: string
  username: string
  content: string
  parent_id: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

// 后端分页响应（snake_case 字段名）
export interface PagedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

// 用户统计数据
export interface UserStats {
  total_skills: number
  total_pv: number
  total_downloads: number
  total_favorites: number
  rating_distribution: Record<string, number>
  trend_7d: Array<{ date: string; pv: number; downloads: number }>
  trend_30d: Array<{ date: string; pv: number; downloads: number }>
}
