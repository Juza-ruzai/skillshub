import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { Menu, Bell, Search, User, Sun, Moon, LogOut, Settings } from 'lucide-react'

interface HeaderProps {
  onSearch?: (keyword: string) => void
  unreadCount?: number
}

export const Header = ({ onSearch, unreadCount = 0 }: HeaderProps): JSX.Element => {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchValue)
    }
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--navbar-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div className="container mx-auto px-4 md:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold font-heading"
          style={{
            background: 'var(--btn-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          OpenClaw
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            首页
          </Link>
          <Link
            to="/upload"
            className="text-sm font-medium transition-colors duration-200"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            上传
          </Link>
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div
            className="relative w-full flex items-center rounded-2xl"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <Search className="absolute left-3 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="搜索 Skills..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            aria-label="切换主题"
            onClick={toggleTheme}
            className="relative flex items-center justify-center rounded-xl transition-all duration-300 hover:scale-110"
            style={{
              width: 40,
              height: 40,
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
              overflow: 'hidden',
            }}
          >
            <Sun
              className="w-5 h-5 absolute transition-all duration-300"
              style={{
                color: 'var(--accent-primary)',
                opacity: theme === 'dark' ? 0 : 1,
                transform: theme === 'dark' ? 'rotate(-90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
              }}
            />
            <Moon
              className="w-5 h-5 absolute transition-all duration-300"
              style={{
                color: 'var(--accent-primary)',
                opacity: theme === 'dark' ? 1 : 0,
                transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0.5)',
              }}
            />
          </button>

          {/* Notification Bell */}
          {isAuthenticated && (
            <button
              aria-label="通知"
              className="relative flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                width: 40,
                height: 40,
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
              }}
            >
              <Bell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              {unreadCount > 0 && (
                <span
                  data-testid="notification-badge"
                  className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Menu - Desktop */}
          <div className="hidden md:block relative">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                  aria-label="个人中心"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--btn-gradient)' }}
                  >
                    {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user?.username}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-2xl z-50 overflow-hidden"
                      style={{
                        background: 'var(--card-bg)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid var(--card-border)',
                        boxShadow: '0 16px 40px rgba(59,130,246,0.15)',
                      }}
                    >
                      <button
                        onClick={() => {
                          navigate('/profile')
                          setUserMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(59,130,246,0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <User className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                        个人中心
                      </button>
                      {user?.isAdmin && (
                        <button
                          onClick={() => {
                            navigate('/admin')
                            setUserMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150"
                          style={{ color: 'var(--text-primary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59,130,246,0.08)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <Settings
                            className="w-4 h-4"
                            style={{ color: 'var(--accent-primary)' }}
                          />
                          管理后台
                        </button>
                      )}
                      <div
                        style={{ height: 1, background: 'var(--card-border)', margin: '4px 0' }}
                      />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150"
                        style={{ color: '#ef4444' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium transition-colors duration-200"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'var(--btn-gradient)',
                    boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
                  }}
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label="菜单"
            className="md:hidden flex items-center justify-center rounded-xl transition-all duration-200"
            style={{
              width: 40,
              height: 40,
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          data-testid="mobile-menu"
          className="md:hidden"
          style={{
            borderTop: '1px solid var(--navbar-border)',
            background: 'var(--navbar-bg)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div
              className="relative flex items-center rounded-2xl"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
              }}
            >
              <Search
                className="absolute left-3 w-4 h-4"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <input
                type="text"
                placeholder="搜索 Skills..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-1">
              <Link
                to="/"
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                首页
              </Link>
              <Link
                to="/upload"
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150"
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                上传
              </Link>
            </nav>

            {/* Mobile User Actions */}
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--card-border)' }}>
              {isAuthenticated ? (
                <div className="flex flex-col gap-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    {user?.username}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                    style={{ color: '#ef4444' }}
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-center rounded-xl text-sm font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-center rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'var(--btn-gradient)' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
