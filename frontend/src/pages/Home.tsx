import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X, Pin, Sparkles, Download, Users } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { getPublicStats } from '@/lib/skillsApi'
import { SkillList } from '@/components/skill/SkillList'
import { Pagination } from '@/components/common/Pagination'
import type { Skill, SkillListResponse } from '@/types/skill'

type TabType = 'hot' | 'trending' | 'top-rated' | 'most-downloaded'

interface FetchSkillsParams {
  tab: TabType
  page: number
  pageSize: number
}

const TAB_ENDPOINTS: Record<TabType, string> = {
  hot: '/skills',
  trending: '/skills/trending',
  'top-rated': '/skills/top-rated',
  'most-downloaded': '/skills/most-downloaded',
}

const TAB_LABELS: Record<TabType, string> = {
  hot: '综合热度',
  trending: '本周热门',
  'top-rated': '评分最高',
  'most-downloaded': '下载最多',
}

// Emoji icons pool for skill cards
const SKILL_ICONS = ['🤖', '📊', '📝', '🔍', '⚡', '🎯', '🛠️', '📈', '🔮', '💡', '🧠', '🚀']

const getSkillIcon = (id: string): string => {
  const index = id.charCodeAt(0) % SKILL_ICONS.length
  return SKILL_ICONS[index]
}

const fetchSkills = async (params: FetchSkillsParams): Promise<SkillListResponse> => {
  const { tab, page, pageSize } = params
  const endpoint = TAB_ENDPOINTS[tab]

  const response = await apiClient.get<SkillListResponse>(endpoint, {
    params: { page, page_size: pageSize },
  })

  return response.data
}

// SVG Ring stat card
interface StatRingProps {
  value: string
  label: string
  icon: React.ReactNode
  progress: number // 0-1
}

function StatRing({ value, label, icon, progress }: StatRingProps): JSX.Element {
  const r = 36
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - progress)

  return (
    <div
      className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl"
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        minWidth: 130,
      }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 90, height: 90 }}>
        <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="statGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-primary)" />
              <stop offset="100%" stopColor="var(--accent-secondary)" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx="45" cy="45" r={r} fill="none" stroke="var(--ring-bg)" strokeWidth="6" />
          {/* Fill */}
          <circle
            cx="45"
            cy="45"
            r={r}
            fill="none"
            stroke="url(#statGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">{icon}</div>
      </div>
      <div className="text-center">
        <div
          className="text-xl font-bold"
          style={{
            background: 'var(--btn-gradient)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {value}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </div>
      </div>
    </div>
  )
}

export function Home(): JSX.Element {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('hot')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const pageSize = 20

  const { data, isLoading, error } = useQuery({
    queryKey: ['skills', activeTab, page],
    queryFn: () => fetchSkills({ tab: activeTab, page, pageSize }),
  })

  const { data: statsData } = useQuery({
    queryKey: ['public-stats'],
    queryFn: getPublicStats,
    staleTime: 60_000,
  })

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSearch = useCallback(() => {
    const trimmed = searchInput.trim()
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    }
  }, [searchInput, navigate])

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSearch()
    },
    [handleSearch]
  )

  const handleSkillClick = useCallback((skill: Skill) => {
    window.location.href = `/skills/${skill.id}`
  }, [])

  const sortedSkills = data?.items
    ? [...data.items].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return 0
      })
    : []

  const errorMessage = error != null ? '加载失败，请稍后重试' : null

  // Hero stats: from public stats API
  const totalSkills = statsData?.total_skills ?? '--'
  const totalDownloads = statsData?.total_downloads ?? 0
  const totalDownloadsDisplay =
    totalDownloads > 1000 ? `${(totalDownloads / 1000).toFixed(1)}k` : String(totalDownloads)
  const totalUsers = statsData?.total_users ?? '--'

  return (
    <div>
      {/* ===== Hero Section ===== */}
      <div className="mb-10 text-center">
        {/* Slogan */}
        <h1
          className="text-4xl md:text-5xl font-bold mb-3 leading-tight"
          style={{
            fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
            color: 'var(--text-primary)',
          }}
        >
          汇集
          <span
            style={{
              background: 'var(--btn-gradient)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            中建
          </span>
          智慧
        </h1>
        <p className="text-base md:text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
          发现、分享和复用 AI Skills，让工作效率倍增
        </p>

        {/* Stat Rings */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 flex-wrap">
          <StatRing
            value={String(totalSkills)}
            label="AI Skills"
            progress={0.75}
            icon={<Sparkles className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />}
          />
          <StatRing
            value={totalDownloadsDisplay}
            label="总下载"
            progress={0.6}
            icon={<Download className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />}
          />
          <StatRing
            value={String(totalUsers)}
            label="注册用户"
            progress={0.9}
            icon={<Users className="h-6 w-6" style={{ color: 'var(--accent-primary)' }} />}
          />
        </div>

        {/* Search Box */}
        <div className="max-w-xl mx-auto">
          <div
            className="relative flex items-center rounded-2xl p-1.5"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <Search className="absolute left-4 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="搜索 Skills 名称、描述或标签..."
              className="flex-1 pl-11 pr-4 py-2.5 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="p-1 mr-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{ background: 'var(--btn-gradient)' }}
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* ===== Tabs ===== */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-xl w-full overflow-x-auto"
        style={{
          background: 'var(--card-bg)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid var(--card-border)',
          scrollbarWidth: 'none',
        }}
        role="tablist"
        aria-label="排序方式"
      >
        {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              role="tab"
              aria-selected={isActive}
              className="flex-1 shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
              style={{
                background: isActive ? 'var(--tab-active-bg)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--tab-active-border)' : '1px solid transparent',
                boxShadow: isActive ? '0 2px 8px rgba(59,130,246,0.08)' : 'none',
              }}
            >
              {TAB_LABELS[tab]}
            </button>
          )
        })}
      </div>

      {/* ===== Skill List ===== */}
      <SkillList
        skills={sortedSkills}
        loading={isLoading}
        error={errorMessage}
        emptyText="暂无 Skill"
        onSkillClick={handleSkillClick}
        renderSkillCard={(skill) => (
          <div
            key={skill.id}
            data-testid="skill-card"
            data-pinned={skill.is_pinned}
            className="relative rounded-2xl cursor-pointer group"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${skill.is_pinned ? 'rgba(59,130,246,0.3)' : 'var(--card-border)'}`,
              boxShadow: 'var(--card-shadow)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={() => handleSkillClick(skill)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSkillClick(skill)
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(59,130,246,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--card-shadow)'
            }}
          >
            {/* Pin badge */}
            {skill.is_pinned && (
              <div className="absolute top-3 right-3 z-10">
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-white"
                  style={{ background: 'var(--btn-gradient)' }}
                >
                  <Pin className="h-3 w-3" />
                  置顶
                </span>
              </div>
            )}

            {/* Card image area — gradient bg + unique emoji per skill */}
            <div
              className="h-28 rounded-t-2xl flex items-center justify-center text-4xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(6,182,212,0.08) 100%)',
              }}
            >
              {getSkillIcon(skill.id)}
            </div>

            <div className="p-4">
              <h3
                className="text-sm font-semibold mb-1.5 line-clamp-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {skill.name}
              </h3>
              <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {skill.description}
              </p>

              {/* Stats row */}
              <div
                className="flex items-center gap-3 text-xs mb-3"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <span title="评分">⭐ {(skill.rating_avg ?? 0).toFixed(1)}</span>
                <span title="下载">↓ {skill.download_count ?? 0}</span>
                <span title="收藏">♥ {skill.favorite_count ?? 0}</span>
              </div>

              {/* Tags */}
              {(skill.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(skill.tags ?? []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full"
                      style={{
                        background: 'rgba(59,130,246,0.08)',
                        color: 'var(--accent-primary)',
                        border: '1px solid rgba(59,130,246,0.15)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author */}
              {skill.author_username && (
                <div
                  className="mt-3 pt-3 text-xs flex items-center gap-1"
                  style={{
                    borderTop: '1px solid var(--card-border)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  <span
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white text-xs font-bold"
                    style={{ background: 'var(--btn-gradient)' }}
                  >
                    {skill.author_username.charAt(0).toUpperCase()}
                  </span>
                  <span>{skill.author_username}</span>
                </div>
              )}
            </div>
          </div>
        )}
      />

      {/* ===== Pagination ===== */}
      {data && data.pages > 1 && (
        <div className="mt-8 flex justify-center" data-testid="pagination-container">
          <Pagination currentPage={page} totalPages={data.pages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}
