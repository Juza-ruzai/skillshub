import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Register from '../Register'

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

describe('Register 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('表单验证', () => {
    it('空用户名应显示验证错误', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        register: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const submitButton = screen.getByRole('button', { name: /注册/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/请输入用户名/i)).toBeInTheDocument()
      })
    })

    it('用户名过短应显示验证错误', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        register: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const usernameInput = screen.getByPlaceholderText(/用户名/i)
      await user.type(usernameInput, 'ab')

      const submitButton = screen.getByRole('button', { name: /注册/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/用户名至少需要3个字符/i)).toBeInTheDocument()
      })
    })

    it('空邮箱应显示验证错误', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        register: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const usernameInput = screen.getByPlaceholderText(/用户名/i)
      await user.type(usernameInput, 'testuser')

      const submitButton = screen.getByRole('button', { name: /注册/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/请输入邮箱/i)).toBeInTheDocument()
      })
    })

    it('无效邮箱格式应显示验证错误', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        register: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const usernameInput = screen.getByPlaceholderText(/用户名/i)
      const emailInput = screen.getByPlaceholderText(/邮箱/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)

      // 使用 fireEvent.change 直接设置值（对受控组件更可靠）
      fireEvent.change(usernameInput, { target: { value: 'testuser' } })
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

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
        register: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const usernameInput = screen.getByPlaceholderText(/用户名/i)
      const emailInput = screen.getByPlaceholderText(/邮箱/i)

      await user.type(usernameInput, 'testuser')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /注册/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/请输入密码/i)).toBeInTheDocument()
      })
    })

    it('密码过短应显示验证错误', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        register: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const usernameInput = screen.getByPlaceholderText(/用户名/i)
      const emailInput = screen.getByPlaceholderText(/邮箱/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)

      await user.type(usernameInput, 'testuser')
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '123')

      const submitButton = screen.getByRole('button', { name: /注册/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/密码至少需要6个字符/i)).toBeInTheDocument()
      })
    })
  })

  describe('密码强度', () => {
    it('弱密码应显示弱强度提示', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        register: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const passwordInput = screen.getByPlaceholderText(/密码/i)
      await user.type(passwordInput, '123456')

      await waitFor(() => {
        expect(screen.getByText(/弱/i)).toBeInTheDocument()
      })
    })

    it('中等密码应显示中等强度提示', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        register: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const passwordInput = screen.getByPlaceholderText(/密码/i)
      // Password: 长度>=8 + 大小写 = 2分 (中等)
      await user.type(passwordInput, 'Password')

      await waitFor(() => {
        expect(screen.getByText(/中/i)).toBeInTheDocument()
      })
    })

    it('强密码应显示高强度提示', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        register: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const passwordInput = screen.getByPlaceholderText(/密码/i)
      await user.type(passwordInput, 'StrongPass123!')

      await waitFor(() => {
        expect(screen.getByText(/强/i)).toBeInTheDocument()
      })
    })
  })

  describe('注册成功', () => {
    it('注册成功后应导航到登录页并预填邮箱', async () => {
      const user = userEvent.setup()
      const mockRegister = vi.fn().mockResolvedValue(undefined)
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        register: mockRegister,
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const usernameInput = screen.getByPlaceholderText(/用户名/i)
      const emailInput = screen.getByPlaceholderText(/邮箱/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)

      await user.type(usernameInput, 'newuser')
      await user.type(emailInput, 'new@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /注册/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
        })
      })

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          state: { email: 'new@example.com' },
        })
      })
    })
  })

  describe('注册失败', () => {
    it('邮箱已存在时应显示对应错误信息', async () => {
      const user = userEvent.setup()
      const mockRegister = vi.fn().mockRejectedValue({
        response: { data: { detail: '邮箱已被注册' } },
      })
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        register: mockRegister,
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const usernameInput = screen.getByPlaceholderText(/用户名/i)
      const emailInput = screen.getByPlaceholderText(/邮箱/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)

      await user.type(usernameInput, 'existinguser')
      await user.type(emailInput, 'existing@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /注册/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/邮箱已被注册/i)).toBeInTheDocument()
      })
    })
  })

  describe('UI 元素', () => {
    it('应显示登录链接', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        register: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const loginLink = screen.getByText(/已有账号/i)
      expect(loginLink).toBeInTheDocument()
    })

    it('加载中应禁用提交按钮', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        register: vi.fn(),
        isAuthenticated: false,
      })

      render(
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      )

      const submitButton = screen.getByRole('button', { name: /注册/i })
      expect(submitButton).toBeDisabled()
    })
  })
})
