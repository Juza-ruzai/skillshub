import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Menu, Bell, Search, User } from 'lucide-react'

interface HeaderProps {
  onSearch?: (keyword: string) => void
  unreadCount?: number
}

export const Header = ({ onSearch, unreadCount = 0 }: HeaderProps): JSX.Element => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchValue)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          OpenClaw
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-foreground hover:text-primary">
            首页
          </Link>
          <Link to="/upload" className="text-foreground hover:text-primary">
            上传
          </Link>
        </nav>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索 Skills..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          {isAuthenticated && (
            <button aria-label="通知" className="relative p-2 hover:bg-accent rounded-full">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  data-testid="notification-badge"
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                >
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent"
                aria-label="个人中心"
              >
                <User className="w-4 h-4" />
                <span>{user?.username}</span>
              </button>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-primary">
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  注册
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            aria-label="菜单"
            className="md:hidden p-2 hover:bg-accent rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div data-testid="mobile-menu" className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索 Skills..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                className="px-4 py-2 hover:bg-accent rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                首页
              </Link>
              <Link
                to="/upload"
                className="px-4 py-2 hover:bg-accent rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                上传
              </Link>
            </nav>

            {/* Mobile User Actions */}
            <div className="pt-4 border-t">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>{user?.username}</span>
                  </Link>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-center hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-center bg-primary text-primary-foreground rounded-md"
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
