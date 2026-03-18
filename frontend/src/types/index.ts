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
