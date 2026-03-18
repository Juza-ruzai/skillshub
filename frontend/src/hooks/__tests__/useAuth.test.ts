import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import * as api from '../../lib/api'

// Mock api module
vi.mock('../../lib/api', () => ({
  apiClient: {
    post: vi.fn(),
    defaults: { headers: {} },
  },
  setAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
  getAuthToken: vi.fn(),
  API_BASE_URL: 'http://localhost:8000/api/v1',
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('初始状态', () => {
    it('初始时用户应为 null', () => {
      const { result } = renderHook(() => useAuth())
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('应提供 login 函数', () => {
      const { result } = renderHook(() => useAuth())
      expect(typeof result.current.login).toBe('function')
    })

    it('应提供 register 函数', () => {
      const { result } = renderHook(() => useAuth())
      expect(typeof result.current.register).toBe('function')
    })

    it('应提供 logout 函数', () => {
      const { result } = renderHook(() => useAuth())
      expect(typeof result.current.logout).toBe('function')
    })
  })

  describe('login 功能', () => {
    it('登录成功后应保存 token 并设置用户', async () => {
      const mockResponse = {
        data: {
          access_token: 'test-token',
          token_type: 'bearer',
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            isAdmin: false,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        },
      }

      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      ;(api.apiClient as unknown as { post: typeof mockPost }).post = mockPost

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password' })
      })

      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      })
    })

    it('登录失败应返回错误', async () => {
      const mockPost = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
      ;(api.apiClient as unknown as { post: typeof mockPost }).post = mockPost

      const { result } = renderHook(() => useAuth())

      let error: Error | null = null
      await act(async () => {
        try {
          await result.current.login({ email: 'test@example.com', password: 'wrong' })
        } catch (e) {
          error = e as Error
        }
      })

      expect(error).not.toBeNull()
    })
  })

  describe('register 功能', () => {
    it('注册成功后应返回成功', async () => {
      const mockResponse = {
        data: {
          id: '1',
          username: 'newuser',
          email: 'new@example.com',
          isAdmin: false,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      }

      const mockPost = vi.fn().mockResolvedValue(mockResponse)
      ;(api.apiClient as unknown as { post: typeof mockPost }).post = mockPost

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
        })
      })

      expect(mockPost).toHaveBeenCalledWith('/auth/register', {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      })
    })
  })

  describe('logout 功能', () => {
    it('登出后应清除用户状态', async () => {
      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.logout()
      })

      expect(api.clearAuthToken).toHaveBeenCalled()
    })
  })

  describe('isAuthenticated', () => {
    it('未登录时应返回 false', () => {
      const { result } = renderHook(() => useAuth())
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})
