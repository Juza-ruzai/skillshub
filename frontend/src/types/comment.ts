// 评论相关类型定义（字段名与后端 snake_case 保持一致）

export interface Comment {
  id: string
  skill_id: string
  user_id: string
  username: string
  content: string
  parent_id?: string
  is_deleted?: boolean
  created_at: string
  updated_at: string
}

export interface CommentCreate {
  content: string
  parent_id?: string
}

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[]
}
