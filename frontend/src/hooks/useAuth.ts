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
  const [isLoading, setIsLoading] = useState(false)

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
    }
    initAuth()
  }, [])

  const login = useCallback(async (credentials: UserLogin): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const { access_token, user: userData } = response.data
      setAuthToken(access_token)
      setUser(userData)
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
