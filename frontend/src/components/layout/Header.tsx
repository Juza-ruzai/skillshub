import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { Menu, Bell, User, Sun, Moon, LogOut, Settings, Upload, ChevronDown } from 'lucide-react'

interface HeaderProps {
  unreadCount?: number
}

export const Header = ({ unreadCount = 0 }: HeaderProps): JSX.Element => {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--navbar-bg)] border-b border-[var(--navbar-border)]">
      <div className="container mx-auto px-4 md:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/cscec-robot.png" alt="中建蓝宝" className="h-9 w-9 object-contain" />
          <span className="text-xl font-bold text-[var(--accent-primary)]">SkillsHub</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            aria-label="切换主题"
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--card-bg)] border border-[var(--border-default)] transition-colors hover:bg-[var(--bg-muted)] overflow-hidden"
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
              className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--card-bg)] border border-[var(--border-default)] transition-colors hover:bg-[var(--bg-muted)]"
            >
              <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
              {unreadCount > 0 && (
                <span
                  data-testid="notification-badge"
                  className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold bg-[#ef4444]"
                >
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Upload Button */}
          {isAuthenticated && (
            <Link
              to="/upload"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--card-bg)] border border-[var(--border-default)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
            >
              <Upload className="w-4 h-4" />
              上传
            </Link>
          )}

          {/* User Menu - Desktop */}
          <div className="hidden md:block relative">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--border-default)] transition-colors hover:bg-[var(--bg-muted)]"
                  aria-label="个人中心"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[var(--accent-primary)]">
                    {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span className="text-sm font-medium max-w-[80px] truncate text-[var(--text-primary)]">
                    {user?.username}
                  </span>
                  <ChevronDown
                    className="w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200"
                    style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 rounded-lg z-50 overflow-hidden bg-[var(--card-bg)] border border-[var(--border-default)] shadow-lg">
                      {/* User Info Header */}
                      <div className="px-4 py-3 flex items-center gap-3 border-b border-[var(--border-default)]">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-[var(--accent-primary)]">
                          {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate text-[var(--text-primary)]">
                            {user?.username}
                          </div>
                          <div className="text-xs truncate text-[var(--text-secondary)]">
                            {user?.email}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          navigate('/profile')
                          setUserMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-subtle)]"
                      >
                        <User className="w-4 h-4 text-[var(--accent-primary)]" />
                        个人中心
                      </button>

                      {user?.is_admin && (
                        <button
                          onClick={() => {
                            navigate('/admin')
                            setUserMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-subtle)]"
                        >
                          <Settings className="w-4 h-4 text-[var(--accent-primary)]" />
                          管理后台
                        </button>
                      )}

                      <div className="h-px bg-[var(--border-default)]" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#ef4444] transition-colors hover:bg-[rgba(239,68,68,0.08)]"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Not logged in */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium rounded-lg text-[var(--text-secondary)] bg-[var(--card-bg)] border border-[var(--border-default)] transition-colors hover:text-[var(--accent-primary)] hover:bg-[var(--bg-muted)]"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-[var(--accent-primary)] transition-colors hover:bg-[var(--accent-primary-hover)]"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label="菜单"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--card-bg)] border border-[var(--border-default)] transition-colors hover:bg-[var(--bg-muted)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          data-testid="mobile-menu"
          className="md:hidden border-t border-[var(--navbar-border)] bg-[var(--navbar-bg)]"
        >
          <div className="container mx-auto px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-default)]">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white bg-[var(--accent-primary)]">
                    {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {user?.username}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">{user?.email}</div>
                  </div>
                </div>
                <Link
                  to="/upload"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--card-bg)] border border-[var(--border-default)] transition-colors hover:text-[var(--text-primary)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Upload className="w-4 h-4" />
                  上传 Skill
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-[var(--text-primary)] bg-[var(--card-bg)] border border-[var(--border-default)] transition-colors hover:bg-[var(--accent-subtle)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4 text-[var(--accent-primary)]" />
                  个人中心
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-[#ef4444] bg-[var(--card-bg)] border border-[var(--border-default)] transition-colors hover:bg-[rgba(239,68,68,0.08)]"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-center rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--card-bg)] border border-[var(--border-default)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 text-center rounded-lg text-sm font-medium text-white bg-[var(--accent-primary)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
