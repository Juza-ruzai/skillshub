// 评论相关类型定义

export interface Comment {
  id: string
  skillId: string
  userId: string
  username: string
  content: string
  parentId?: string
  isDeleted?: boolean
  createdAt: string
  updatedAt: string
}

export interface CommentCreate {
  content: string
  parentId?: string
}

export interface CommentWithReplies extends Comment {
  replies: Comment[]
}

export interface CommentListResponse {
  items: CommentWithReplies[]
  total: number
}
