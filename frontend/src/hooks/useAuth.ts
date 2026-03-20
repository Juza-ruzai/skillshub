import { useState, useCallback, useEffect } from 'react'
import { apiClient, setAuthToken, clearAuthToken, getAuthToken } from '../lib/api'
import type { User, UserLogin, UserCreate } from '../types'

interface AuthState {
  user: User | null
  isLoading: boolean
}

interface UseAuthReturn extends AuthState {
  login: (credentials: UserLogin) => Promise<void>
  register: (data: UserCreate) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(() => !!getAuthToken())

  // 初始化时检查本地 token
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken()
      if (token) {
        try {
          const response = await apiClient.get('/auth/me')
          setUser(response.data)
        } catch {
          clearAuthToken()
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (credentials: UserLogin): Promise<void> => {
    setIsLoading(true)
    try {
      const formData = new URLSearchParams()
      formData.append('username', credentials.email)
      formData.append('password', credentials.password)
      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      const { access_token } = response.data
      setAuthToken(access_token)
      const meResponse = await apiClient.get('/auth/me')
      setUser(meResponse.data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (data: UserCreate): Promise<void> => {
    setIsLoading(true)
    try {
      await apiClient.post('/auth/register', data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      clearAuthToken()
      setUser(null)
    }
  }, [])

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: user !== null,
  }
}
