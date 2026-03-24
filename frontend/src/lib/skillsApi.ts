import { apiClient } from './api'
import type {
  Skill,
  SkillListResponse,
  SkillCreate,
  SkillUpdate,
  SkillSearchParams,
} from '../types/skill'

export const getSkills = async (params: SkillSearchParams = {}): Promise<SkillListResponse> => {
  const response = await apiClient.get('/skills', { params })
  return response.data
}

export const getSkillDetail = async (id: string): Promise<Skill> => {
  const response = await apiClient.get(`/skills/${id}`)
  return response.data
}

export const createSkill = async (data: SkillCreate): Promise<Skill> => {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('description', data.description)
  formData.append('usage_scenario', data.usageScenario)
  formData.append('usage_method', data.usageMethod)
  if (data.tags) {
    formData.append('tags', JSON.stringify(data.tags))
  }
  if (data.file) {
    formData.append('file', data.file)
  }

  const response = await apiClient.post('/skills', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const updateSkill = async (id: string, data: SkillUpdate): Promise<Skill> => {
  const formData = new FormData()
  if (data.name) formData.append('name', data.name)
  if (data.description) formData.append('description', data.description)
  if (data.usageScenario) formData.append('usage_scenario', data.usageScenario)
  if (data.usageMethod) formData.append('usage_method', data.usageMethod)
  if (data.tags) formData.append('tags', JSON.stringify(data.tags))
  if (data.file) formData.append('file', data.file)

  const response = await apiClient.put(`/skills/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const deleteSkill = async (id: string): Promise<void> => {
  await apiClient.delete(`/skills/${id}`)
}

export const rateSkill = async (id: string, score: number): Promise<void> => {
  await apiClient.post(`/skills/${id}/rate`, { score })
}

export const toggleFavorite = async (id: string): Promise<{ is_favorited: boolean }> => {
  const response = await apiClient.post(`/skills/${id}/favorite`)
  return response.data
}

export const downloadSkill = async (id: string): Promise<{ download_url: string }> => {
  const response = await apiClient.post(`/skills/${id}/download`)
  return response.data
}

export const getTrendingSkills = async (): Promise<Skill[]> => {
  const response = await apiClient.get('/skills/trending')
  return response.data
}

export const getTopRatedSkills = async (): Promise<Skill[]> => {
  const response = await apiClient.get('/skills/top-rated')
  return response.data
}

export const getMostDownloadedSkills = async (): Promise<Skill[]> => {
  const response = await apiClient.get('/skills/most-downloaded')
  return response.data
}

export interface PublicStats {
  total_skills: number
  total_downloads: number
  total_users: number
}

export const getPublicStats = async (): Promise<PublicStats> => {
  const response = await apiClient.get('/stats/public')
  return response.data
}

export interface TagItem {
  name: string
  count: number
}

export const getTags = async (): Promise<TagItem[]> => {
  const response = await apiClient.get<{ items: { name: string; usage_count: number }[] }>('/tags')
  return response.data.items.map((t) => ({ name: t.name, count: t.usage_count }))
}

// 上传编辑器内图片
export const uploadContentImage = async (skillId: string, file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post(`/skills/${skillId}/content-images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// 上传封面图片
export const uploadCover = async (skillId: string, file: File): Promise<{ cover_url: string }> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post(`/skills/${skillId}/cover`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

// 删除封面图片
export const deleteCover = async (skillId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/skills/${skillId}/cover`)
  return response.data
}

// 获取 Skill 文件内容（用于预览 SKILL.md）
export const getSkillFileContent = async (
  skillId: string,
  filePath: string
): Promise<{ content: string }> => {
  const response = await apiClient.get(`/skills/${skillId}/files/${filePath}`)
  return response.data
}
