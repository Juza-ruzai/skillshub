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

// Stat card component
interface StatCardProps {
  value: string
  label: string
  icon: React.ReactNode
}

function StatCard({ value, label, icon }: StatCardProps): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] shadow-sm min-w-[120px]">
      <div className="text-[var(--accent-primary)]">{icon}</div>
      <div className="text-2xl font-bold text-[var(--accent-primary)]">{value}</div>
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
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
      {/* Hero Section */}
      <div className="mb-10 text-center">
        {/* Slogan */}
        <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight text-[var(--text-primary)]">
          汇集中建智慧
        </h1>
        <p className="text-base md:text-lg mb-8 text-[var(--text-secondary)]">
          发现、分享和复用 AI Skills，让工作效率倍增
        </p>

        {/* Stat Cards */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 flex-wrap">
          <StatCard
            value={String(totalSkills)}
            label="AI Skills"
            icon={<Sparkles className="h-6 w-6" />}
          />
          <StatCard
            value={totalDownloadsDisplay}
            label="总下载"
            icon={<Download className="h-6 w-6" />}
          />
          <StatCard
            value={String(totalUsers)}
            label="注册用户"
            icon={<Users className="h-6 w-6" />}
          />
        </div>

        {/* Search Box */}
        <div className="max-w-xl mx-auto">
          <div className="relative flex items-center rounded-lg p-1 bg-[var(--card-bg)] border border-[var(--border-default)] shadow-sm">
            <Search className="absolute left-4 w-5 h-5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="搜索 Skills 名称、描述或标签..."
              className="flex-1 pl-11 pr-4 py-2.5 bg-transparent outline-none text-sm text-[var(--text-primary)]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="p-1 mr-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-[var(--accent-primary)] transition-colors hover:bg-[var(--accent-primary-hover)]"
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-lg w-full overflow-x-auto bg-[var(--bg-subtle)] border border-[var(--border-muted)]"
        role="tablist"
        aria-label="排序方式"
        style={{ scrollbarWidth: 'none' }}
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
              className="flex-1 shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                background: isActive ? 'var(--card-bg)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {TAB_LABELS[tab]}
            </button>
          )
        })}
      </div>

      {/* Skill List */}
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
            className="relative rounded-xl cursor-pointer group bg-[var(--card-bg)] border border-[var(--border-default)] shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1"
            onClick={() => handleSkillClick(skill)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSkillClick(skill)
            }}
          >
            {/* Pin badge */}
            {skill.is_pinned && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-white bg-[var(--accent-primary)]">
                  <Pin className="h-3 w-3" />
                  置顶
                </span>
              </div>
            )}

            {/* Cover image */}
            <div className="h-28 rounded-t-xl flex items-center justify-center text-4xl overflow-hidden bg-[var(--bg-subtle)]">
              {skill.cover_url ? (
                <img
                  src={skill.cover_url}
                  alt={skill.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement!.innerHTML = getSkillIcon(skill.id)
                  }}
                />
              ) : (
                getSkillIcon(skill.id)
              )}
            </div>

            <div className="p-4">
              <h3 className="text-sm font-semibold mb-1.5 line-clamp-1 text-[var(--text-primary)]">
                {skill.name}
              </h3>
              <p className="text-xs mb-3 line-clamp-2 text-[var(--text-secondary)]">
                {skill.description}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-3 text-xs mb-3 text-[var(--text-tertiary)]">
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
                      className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--border-emphasis)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author */}
              {skill.author_username && (
                <div className="mt-3 pt-3 text-xs flex items-center gap-1 border-t border-[var(--border-default)] text-[var(--text-tertiary)]">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white text-xs font-bold bg-[var(--accent-primary)]">
                    {skill.author_username.charAt(0).toUpperCase()}
                  </span>
                  <span>{skill.author_username}</span>
                </div>
              )}
            </div>
          </div>
        )}
      />

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="mt-8 flex justify-center" data-testid="pagination-container">
          <Pagination currentPage={page} totalPages={data.pages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  )
}
