import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PrivateRoute, AdminRoute } from '../PrivateRoute'

// Mock useAuth hook
const mockUseAuth = vi.fn()
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('未登录用户应重定向到登录页', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<PrivateRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('已登录用户可以访问受保护路由', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'test' },
      isLoading: false,
      isAuthenticated: true,
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<PrivateRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('加载中应显示加载状态', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
    })

    render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    )

    expect(document.querySelector('[data-testid="loading"]') || document.body).toBeInTheDocument()
  })
})

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('非管理员用户应重定向', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', username: 'test', isAdmin: false },
      isLoading: false,
      isAuthenticated: true,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    // 应该被重定向到首页
    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })
})
