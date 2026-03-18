import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from '../Login'

// Mock useAuth hook
const mockUseAuth = vi.fn()
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('表单验证', () => {
    it('空邮箱应显示验证错误并阻止提交', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      )

      const submitButton = screen.getByRole('button', { name: /登录/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/请输入邮箱/i)).toBeInTheDocument()
      })
    })

    it('无效邮箱格式应显示验证错误', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      )

      const emailInput = screen.getByPlaceholderText(/邮箱/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)

      // 使用 fireEvent.change 直接设置值（对受控组件更可靠）
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'somepassword' } })

      // 获取表单并直接提交
      const form = emailInput.closest('form')
      expect(form).not.toBeNull()
      fireEvent.submit(form!)

      // 等待错误消息出现
      await waitFor(() => {
        expect(screen.getByText(/请输入有效的邮箱地址/i)).toBeInTheDocument()
      })
    })

    it('空密码应显示验证错误', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      )

      const emailInput = screen.getByPlaceholderText(/邮箱/i)
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /登录/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/请输入密码/i)).toBeInTheDocument()
      })
    })
  })

  describe('登录成功', () => {
    it('登录成功后应导航到首页', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockResolvedValue(undefined)
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        login: mockLogin,
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      )

      const emailInput = screen.getByPlaceholderText(/邮箱/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /登录/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('登录失败', () => {
    it('邮箱不存在时应显示对应错误信息', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockRejectedValue({
        response: { data: { detail: '用户不存在' } },
      })
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        login: mockLogin,
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      )

      const emailInput = screen.getByPlaceholderText(/邮箱/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)

      await user.type(emailInput, 'notfound@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /登录/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/用户不存在/i)).toBeInTheDocument()
      })
    })

    it('密码错误时应显示对应错误信息', async () => {
      const user = userEvent.setup()
      const mockLogin = vi.fn().mockRejectedValue({
        response: { data: { detail: '密码错误' } },
      })
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        login: mockLogin,
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      )

      const emailInput = screen.getByPlaceholderText(/邮箱/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')

      const submitButton = screen.getByRole('button', { name: /登录/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/密码错误/i)).toBeInTheDocument()
      })
    })
  })

  describe('已登录重定向', () => {
    it('已登录用户访问登录页应重定向到首页', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', username: 'test' },
        isLoading: false,
        login: vi.fn(),
        isAuthenticated: true,
      })

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      )

      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  describe('UI 元素', () => {
    it('应显示注册链接', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      )

      const registerLink = screen.getByText(/还没有账号/i)
      expect(registerLink).toBeInTheDocument()
    })

    it('加载中应禁用提交按钮', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        login: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      )

      const submitButton = screen.getByRole('button', { name: /登录/i })
      expect(submitButton).toBeDisabled()
    })
  })
})
