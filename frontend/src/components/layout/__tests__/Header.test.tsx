import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Header } from '../Header'

// Mock useAuth hook
const mockUseAuth = vi.fn()
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该渲染 Logo 和品牌名称', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      })

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      )

      expect(screen.getByText('SkillsHub')).toBeInTheDocument()
    })

    it('应该渲染蓝宝机器人图片', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      })

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      )

      const logo = screen.getByAltText('中建蓝宝')
      expect(logo).toBeInTheDocument()
    })

    it('应该固定在顶部且有正确的 z-index', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      })

      const { container } = render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      )

      const header = container.querySelector('header')
      expect(header).toHaveClass('fixed', 'top-0', 'z-50')
    })
  })

  describe('用户状态', () => {
    it('未登录时显示登录/注册按钮', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      })

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      )

      expect(screen.getByText('登录')).toBeInTheDocument()
      expect(screen.getByText('注册')).toBeInTheDocument()
    })

    it('已登录时显示用户名和头像', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        isAuthenticated: true,
      })

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      )

      expect(screen.getByText('testuser')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /个人中心/i })).toBeInTheDocument()
    })
  })

  describe('通知功能', () => {
    it('应该显示通知图标', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        isAuthenticated: true,
      })

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      )

      expect(screen.getByLabelText(/通知/i)).toBeInTheDocument()
    })

    it('有未读通知时显示红点', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        isAuthenticated: true,
      })

      const { container } = render(
        <BrowserRouter>
          <Header unreadCount={5} />
        </BrowserRouter>
      )

      const badge = container.querySelector('[data-testid="notification-badge"]')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('5')
    })

    it('无未读通知时不显示红点', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
        },
        isAuthenticated: true,
      })

      const { container } = render(
        <BrowserRouter>
          <Header unreadCount={0} />
        </BrowserRouter>
      )

      const badge = container.querySelector('[data-testid="notification-badge"]')
      expect(badge).not.toBeInTheDocument()
    })
  })

  describe('移动端菜单', () => {
    it('移动端显示汉堡菜单按钮', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      })

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      )

      expect(screen.getByLabelText(/菜单/i)).toBeInTheDocument()
    })

    it('点击汉堡菜单展开移动端导航', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
      })

      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      )

      const menuButton = screen.getByLabelText(/菜单/i)
      fireEvent.click(menuButton)

      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
    })
  })
})
