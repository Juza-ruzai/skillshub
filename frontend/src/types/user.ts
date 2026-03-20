// 用户相关类型定义

export interface User {
  id: string
  username: string
  email: string
  is_admin: boolean
  is_active?: boolean
  avatar_url?: string
  created_at: string
  updated_at?: string
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
