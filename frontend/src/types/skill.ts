// Skill 相关类型定义
import type { Comment } from './comment'

export interface Skill {
  id: string
  name: string
  description: string
  usage_scenario: string
  usage_method: string
  demo_images?: { url: string; caption?: string }[]
  cover_url?: string
  file_path: string
  file_size: number
  file_tree?: FileTreeNode[]
  tags: string[]
  author_id: string
  author_username?: string
  is_deleted: boolean
  is_pinned: boolean
  download_count: number
  view_count: number
  favorite_count: number
  rating_avg: number
  rating_count: number
  is_favorite?: boolean
  user_rating?: number
  created_at: string
  updated_at: string
}

export interface FileTreeNode {
  name: string
  type: 'file' | 'directory'
  path?: string
  children?: FileTreeNode[]
}

export interface SkillCreate {
  name: string
  description: string
  usageScenario: string
  usageMethod: string
  tags?: string[]
  file?: File
}

export interface SkillUpdate {
  name?: string
  description?: string
  usageScenario?: string
  usageMethod?: string
  tags?: string[]
  file?: File
}

export interface SkillListResponse {
  items: Skill[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface SkillDetail extends Skill {
  content?: string
  comments?: Comment[]
}

export interface SkillSearchParams {
  page?: number
  pageSize?: number
  sort?: 'hot' | 'newest' | 'rating' | 'downloads'
  tag?: string
  q?: string
}
