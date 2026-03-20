import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, MessageCircle, BarChart2 } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: '概览' },
  { to: '/admin/skills', icon: <BookOpen size={18} />, label: 'Skill 管理' },
  { to: '/admin/users', icon: <Users size={18} />, label: '用户管理' },
  { to: '/admin/comments', icon: <MessageCircle size={18} />, label: '评论管理' },
  { to: '/admin/stats', icon: <BarChart2 size={18} />, label: '数据统计' },
]

export default function AdminLayout(): JSX.Element {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 flex-shrink-0 py-6 px-3 gap-1"
        style={{
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--card-border)',
        }}
      >
        <div className="px-3 mb-4">
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            管理后台
          </h2>
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'text-white' : 'hover:opacity-80'}`
            }
            style={({ isActive }) =>
              isActive
                ? { background: 'var(--btn-gradient)', color: '#fff' }
                : { color: 'var(--text-muted)' }
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </aside>

      {/* Mobile top tabs */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t"
        style={{
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          borderColor: 'var(--card-border)',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex-1 flex flex-col items-center py-2 gap-0.5 text-xs"
            style={({ isActive }) =>
              isActive
                ? { color: 'var(--accent-primary, #3b82f6)' }
                : { color: 'var(--text-muted)' }
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-6 pb-20 lg:pb-6">
        <Outlet />
      </main>
    </div>
  )
}
