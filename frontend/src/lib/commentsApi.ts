import { apiClient } from './api'
import type { CommentListResponse, CommentCreate, Comment } from '../types/comment'

export const getSkillComments = async (skillId: string): Promise<CommentListResponse> => {
  const response = await apiClient.get(`/skills/${skillId}/comments`)
  return response.data
}

export const postComment = async (skillId: string, data: CommentCreate): Promise<Comment> => {
  const response = await apiClient.post(`/skills/${skillId}/comments`, data)
  return response.data
}

export const deleteComment = async (commentId: string): Promise<void> => {
  await apiClient.delete(`/comments/${commentId}`)
}
