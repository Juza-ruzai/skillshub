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
        {/* Logo：蓝宝图片 + SkillsHub 文字 */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/cscec-robot.png"
            alt="中建蓝宝"
            className="h-9 w-9 object-contain"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(59,130,246,0.3))' }}
          />
          <span
            className="text-xl font-bold font-heading"
            style={{
              background: 'var(--btn-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SkillsHub
          </span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
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

          {/* Notification Bell — 登录后显示 */}
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

          {/* 上传按钮 — 登录后显示，桌面端 */}
          {isAuthenticated && (
            <Link
              to="/upload"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Upload className="w-4 h-4" />
              上传
            </Link>
          )}

          {/* User Menu — 桌面端 */}
          <div className="hidden md:block relative">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                  aria-label="个人中心"
                >
                  {/* 头像圆形 */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: 'var(--btn-gradient)' }}
                  >
                    {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <span
                    className="text-sm font-medium max-w-[80px] truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {user?.username}
                  </span>
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-200"
                    style={{
                      color: 'var(--text-secondary)',
                      transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div
                      className="absolute right-0 mt-2 w-52 rounded-2xl z-50 overflow-hidden"
                      style={{
                        background: 'var(--card-bg)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid var(--card-border)',
                        boxShadow: '0 16px 40px rgba(59,130,246,0.15)',
                      }}
                    >
                      {/* 用户信息头部 */}
                      <div
                        className="px-4 py-3 flex items-center gap-3"
                        style={{ borderBottom: '1px solid var(--card-border)' }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ background: 'var(--btn-gradient)' }}
                        >
                          {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                        </div>
                        <div className="min-w-0">
                          <div
                            className="text-sm font-semibold truncate"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {user?.username}
                          </div>
                          <div
                            className="text-xs truncate"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {user?.email}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          navigate('/profile')
                          setUserMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150"
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
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150"
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
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150"
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
              /* 未登录：登录 + 注册 */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200"
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
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
          <div className="container mx-auto px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: 'var(--btn-gradient)' }}
                  >
                    {user?.username?.charAt(0).toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {user?.username}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {user?.email}
                    </div>
                  </div>
                </div>
                <Link
                  to="/upload"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Upload className="w-4 h-4" />
                  上传 Skill
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                  style={{
                    color: 'var(--text-primary)',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  个人中心
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                  style={{
                    color: '#ef4444',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-center rounded-xl text-sm font-medium"
                  style={{
                    color: 'var(--text-secondary)',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 text-center rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'var(--btn-gradient)' }}
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
