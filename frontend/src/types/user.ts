// 用户相关类型定义

export interface User {
  id: string
  username: string
  email: string
  isAdmin: boolean
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface UserCreate {
  username: string
  email: string
  password: string
}

export interface UserLogin {
  email: string
  password: string
}

export interface TokenResponse {
  accessToken: string
  tokenType: string
}

export interface UserStats {
  totalViews: number
  totalDownloads: number
  totalFavorites: number
  ratingDistribution: Record<number, number>
  trend7d: { date: string; value: number }[]
  trend30d: { date: string; value: number }[]
}
