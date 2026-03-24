import { apiClient } from './api'
import type { CommentCreate, Comment, CommentWithReplies } from '../types/comment'

export const getSkillComments = async (skillId: string): Promise<CommentWithReplies[]> => {
  const response = await apiClient.get(`/skills/${skillId}/comments/`)
  return response.data
}

export const postComment = async (skillId: string, data: CommentCreate): Promise<Comment> => {
  const response = await apiClient.post(`/skills/${skillId}/comments/`, data)
  return response.data
}

export const deleteComment = async (commentId: string): Promise<void> => {
  await apiClient.delete(`/comments/${commentId}`)
}
