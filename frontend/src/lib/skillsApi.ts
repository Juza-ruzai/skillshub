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

export const toggleFavorite = async (id: string): Promise<{ isFavorite: boolean }> => {
  const response = await apiClient.post(`/skills/${id}/favorite`)
  return response.data
}

export const downloadSkill = async (id: string): Promise<{ url: string }> => {
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
