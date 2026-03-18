// Skill 相关类型定义
import type { Comment } from './comment'

export interface Skill {
  id: string
  name: string
  description: string
  usageScenario: string
  usageMethod: string
  demoImages?: { url: string; caption?: string }[]
  filePath: string
  fileSize: number
  fileTree?: FileTreeNode[]
  tags: string[]
  authorId: string
  authorUsername?: string
  isDeleted: boolean
  isPinned: boolean
  downloadCount: number
  viewCount: number
  favoriteCount: number
  ratingAvg: number
  ratingCount: number
  isFavorite?: boolean
  userRating?: number
  createdAt: string
  updatedAt: string
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
  pageSize: number
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
