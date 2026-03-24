import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { User, BookOpen, Heart, MessageCircle, TrendingUp, Download, Eye, Star } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../lib/api'
import type { UserStats } from '../types'

// ---- SVG Rating Bar Chart ----
function RatingBarChart({ distribution }: { distribution: Record<string, number> }): JSX.Element {
  const maxVal = Math.max(1, ...Object.values(distribution))
  return (
    <div className="flex flex-col gap-1">
      {['5', '4', '3', '2', '1'].map((star) => {
        const val = distribution[star] ?? 0
        const pct = (val / maxVal) * 100
        return (
          <div key={star} className="flex items-center gap-2 text-xs">
            <span className="w-4 text-right" style={{ color: 'var(--text-muted)' }}>
              {star}
            </span>
            <div
              className="flex-1 h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--card-border)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: 'var(--btn-gradient)',
                }}
              />
            </div>
            <span className="w-5 text-left" style={{ color: 'var(--text-muted)' }}>
              {val}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ---- SVG Trend Line Chart ----
interface TrendPoint {
  date: string
  pv: number
  downloads: number
}

function TrendLineChart({ data }: { data: TrendPoint[] }): JSX.Element {
  if (!data.length) return <div className="h-20" />

  const maxPv = Math.max(1, ...data.map((d) => d.pv))
  const W = 220
  const H = 60
  const pad = 4

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = H - pad - (d.pv / maxPv) * (H - pad * 2)
    return `${x},${y}`
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-primary, #6366f1)" />
          <stop offset="100%" stopColor="var(--color-accent, #a855f7)" />
        </linearGradient>
      </defs>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke="url(#trendGrad)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((_, i) => {
        const [px, py] = (points[i] ?? '0,0').split(',')
        return <circle key={i} cx={px} cy={py} r="2.5" fill="url(#trendGrad)" />
      })}
    </svg>
  )
}

// ---- Stats Panel ----
function StatsPanel({ stats }: { stats: UserStats }): JSX.Element {
  const [trendMode, setTrendMode] = useState<'7d' | '30d'>('7d')
  const trendData = trendMode === '7d' ? stats.trend_7d : stats.trend_30d

  const metrics = [
    { label: '浏览量', value: stats.total_pv, icon: <Eye size={16} /> },
    { label: '下载量', value: stats.total_downloads, icon: <Download size={16} /> },
    { label: '收藏数', value: stats.total_favorites, icon: <Heart size={16} /> },
    { label: '作品数', value: stats.total_skills, icon: <BookOpen size={16} /> },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center gap-1 p-3 rounded-lg"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>{m.icon}</span>
            <span
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {m.value}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Rating distribution */}
      <div
        className="p-4 rounded-lg"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Star size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            评分分布
          </span>
        </div>
        <RatingBarChart distribution={stats.rating_distribution} />
      </div>

      {/* Trend chart */}
      <div
        className="p-4 rounded-lg"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              浏览趋势
            </span>
          </div>
          <div className="flex gap-1">
            {(['7d', '30d'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTrendMode(m)}
                className="px-2 py-0.5 rounded text-xs transition-colors"
                style={
                  trendMode === m
                    ? { background: 'var(--accent-primary)', color: '#fff' }
                    : { color: 'var(--text-muted)', background: 'transparent' }
                }
              >
                {m === '7d' ? '7天' : '30天'}
              </button>
            ))}
          </div>
        </div>
        <TrendLineChart data={trendData} />
      </div>
    </div>
  )
}

// ---- Skeleton loader ----
function SkeletonBlock({ className }: { className?: string }): JSX.Element {
  return (
    <div
      className={`rounded-xl animate-pulse ${className ?? ''}`}
      style={{ background: 'var(--card-border)' }}
    />
  )
}

// ---- Main Page ----
export default function UserProfile(): JSX.Element {
  const { user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const res = await apiClient.get<UserStats>('/users/me/stats')
      return res.data
    },
    enabled: !!user,
  })

  // Redirect if not logged in
  if (!authLoading && !user) {
    navigate('/login', { replace: true })
    return <></>
  }

  const tabs = [
    { to: '/profile/skills', label: '我的 Skills', icon: <BookOpen size={16} /> },
    { to: '/profile/favorites', label: '我的收藏', icon: <Heart size={16} /> },
    { to: '/profile/comments', label: '我的评论', icon: <MessageCircle size={16} /> },
  ]

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    : '—'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* User info card */}
      <div
        className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 rounded-xl mb-6"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent-primary)' }}
        >
          <User size={28} className="text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          {authLoading ? (
            <>
              <SkeletonBlock className="h-6 w-40 mb-2" />
              <SkeletonBlock className="h-4 w-56 mb-3" />
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {user?.username}
              </h1>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                {user?.email}
              </p>
            </>
          )}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {[
              { label: `加入 ${joinDate}`, icon: '📅' },
              { label: `${stats?.total_skills ?? '—'} 个作品`, icon: '📦' },
              { label: `${stats?.total_favorites ?? '—'} 次收藏`, icon: '❤️' },
            ].map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs"
                style={{
                  background: 'var(--card-border)',
                  color: 'var(--text-muted)',
                }}
              >
                {badge.icon} {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Body: content + sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: tabs + outlet */}
        <div className="flex-1 min-w-0">
          {/* Tab navigation */}
          <div
            className="flex gap-1 p-1 rounded-lg mb-5"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
            }}
          >
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-colors ${isActive ? '' : ''}`
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: 'var(--accent-primary)', color: '#fff' }
                    : { color: 'var(--text-muted)' }
                }
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.label.replace('我的 ', '').replace('我的', '')}
                </span>
              </NavLink>
            ))}
          </div>

          {/* Sub-route content */}
          <Outlet />
        </div>

        {/* Right: stats panel */}
        <div className="lg:w-72 flex-shrink-0">
          {statsLoading || !stats ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonBlock key={i} className="h-20" />
                ))}
              </div>
              <SkeletonBlock className="h-32" />
              <SkeletonBlock className="h-28" />
            </div>
          ) : (
            <StatsPanel stats={stats} />
          )}
        </div>
      </div>
    </div>
  )
}
