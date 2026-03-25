import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X, Pin } from 'lucide-react'
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
    <div className="-mx-4 md:-mx-10">
      {/* Hero Section - Minimal & Refined (Full width) */}
      <div className="relative py-16 sm:py-20 md:py-32 flex flex-col items-center overflow-hidden bg-[var(--bg-base)]">
        {/* Subtle gradient blurs - responsive sizing */}
        <div
          className="absolute rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px] pointer-events-none"
          style={{
            top: '-100px',
            right: '-20%',
            width: 'clamp(300px, 60vw, 600px)',
            height: 'clamp(300px, 60vw, 600px)',
            background: 'var(--accent-primary)',
            opacity: 'var(--hero-glow-opacity, 0.15)',
          }}
        />
        <div
          className="absolute rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] pointer-events-none"
          style={{
            bottom: '-80px',
            left: '-20%',
            width: 'clamp(250px, 50vw, 500px)',
            height: 'clamp(250px, 50vw, 500px)',
            background: 'var(--accent-primary)',
            opacity: 'var(--hero-glow-opacity, 0.08)',
          }}
        />

        {/* Main content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto w-full">
          {/* Label - Small uppercase - hidden on very small screens */}
          <div
            className="hidden sm:block mb-6 md:mb-8 animate-slide-up"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--accent-primary)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Enterprise AI Skills Platform
          </div>

          {/* Title - Large & Bold with accent color on "中建" */}
          <h1
            className="mb-4 md:mb-5 animate-slide-up stagger-1"
            style={{
              fontSize: 'clamp(32px, 7vw, 64px)',
              fontWeight: 600,
              letterSpacing: '-1px',
              lineHeight: 1.15,
              color: 'var(--text-primary)',
            }}
          >
            汇集<span style={{ color: 'var(--accent-primary)' }}>中建</span>智慧
          </h1>

          {/* Subtitle - Relaxed */}
          <p
            className="mb-8 md:mb-12 animate-slide-up stagger-2"
            style={{
              fontSize: 'clamp(15px, 3vw, 18px)',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            发现、分享和复用 AI Skills，让效率倍增
          </p>

          {/* Search Box - Responsive */}
          <div className="w-full max-w-xl mx-auto mb-10 md:mb-16 animate-slide-up stagger-3">
            <div
              className="relative flex items-center rounded-xl sm:rounded-2xl transition-all duration-200"
              style={{
                background: 'var(--card-bg)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-muted)',
              }}
            >
              <Search
                className="ml-4 sm:ml-6 w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="搜索技能、作者或标签..."
                aria-label="搜索技能"
                className="flex-1 px-3 sm:px-5 py-3.5 sm:py-5 bg-transparent outline-none min-w-0"
                style={{
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  color: 'var(--text-primary)',
                }}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="p-2 mr-1 rounded-lg transition-all hover:bg-[var(--bg-subtle)] shrink-0"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleSearch}
                className="hidden sm:flex items-center mr-4 px-6 py-3 rounded-xl font-medium transition-all active:scale-[0.98] shrink-0"
                style={{
                  fontSize: '15px',
                  color: '#ffffff',
                  background: 'var(--accent-primary)',
                }}
              >
                搜索
              </button>
              {/* Mobile search icon button */}
              <button
                type="button"
                onClick={handleSearch}
                className="sm:hidden flex items-center justify-center w-10 h-10 mr-2 rounded-xl transition-all active:scale-[0.98] shrink-0"
                style={{
                  color: '#ffffff',
                  background: 'var(--accent-primary)',
                }}
                aria-label="搜索"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats - Responsive: stack on mobile, horizontal on tablet+ */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 md:gap-16 animate-slide-up stagger-4">
            {/* Mobile: horizontal layout within each stat */}
            <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0">
              <div
                style={{
                  fontSize: 'clamp(36px, 8vw, 48px)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {totalSkills}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginTop: '0',
                }}
                className="sm:mt-1"
              >
                技能
              </div>
            </div>
            {/* Divider - hidden on mobile */}
            <div
              className="hidden sm:block"
              style={{
                width: '1px',
                height: '48px',
                background: 'var(--border-default)',
              }}
            />
            <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0">
              <div
                style={{
                  fontSize: 'clamp(36px, 8vw, 48px)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {totalDownloadsDisplay}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginTop: '0',
                }}
                className="sm:mt-1"
              >
                下载
              </div>
            </div>
            {/* Divider - hidden on mobile */}
            <div
              className="hidden sm:block"
              style={{
                width: '1px',
                height: '48px',
                background: 'var(--border-default)',
              }}
            />
            <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0">
              <div
                style={{
                  fontSize: 'clamp(36px, 8vw, 48px)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {totalUsers}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginTop: '0',
                }}
                className="sm:mt-1"
              >
                用户
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - With container padding */}
      <div className="mx-4 md:mx-10">
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
                className="flex-1 shrink-0 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap min-h-[44px]"
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
              className="relative rounded-lg sm:rounded-xl cursor-pointer group bg-[var(--card-bg)] border border-[var(--border-default)] shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1"
              onClick={() => handleSkillClick(skill)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSkillClick(skill)
              }}
            >
              {/* Pin badge */}
              {skill.is_pinned && (
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                  <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full text-white bg-[var(--accent-primary)]">
                    <Pin className="h-3 w-3" />
                    <span className="hidden sm:inline">置顶</span>
                  </span>
                </div>
              )}

              {/* Cover image - Better aspect ratio for visual appeal */}
              <div className="aspect-[16/10] rounded-t-lg sm:rounded-t-xl flex items-center justify-center text-4xl sm:text-5xl overflow-hidden bg-[var(--bg-subtle)]">
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
                  <span className="opacity-60">{getSkillIcon(skill.id)}</span>
                )}
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-1.5 line-clamp-1 text-[var(--text-primary)]">
                  {skill.name}
                </h3>
                <p className="text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 text-[var(--text-secondary)]">
                  {skill.description}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm mb-2 sm:mb-3 text-[var(--text-tertiary)]">
                  <span title="评分">⭐ {(skill.rating_avg ?? 0).toFixed(1)}</span>
                  <span title="下载">↓ {skill.download_count ?? 0}</span>
                  <span title="收藏">♥ {skill.favorite_count ?? 0}</span>
                </div>

                {/* Tags */}
                {(skill.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {(skill.tags ?? []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 sm:px-2.5 py-0.5 text-xs rounded-full bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--border-emphasis)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author */}
                {skill.author_username && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 text-xs flex items-center gap-1 border-t border-[var(--border-default)] text-[var(--text-tertiary)]">
                    <span className="inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full text-white text-xs font-bold bg-[var(--accent-primary)]">
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
            <Pagination
              currentPage={page}
              totalPages={data.pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}
