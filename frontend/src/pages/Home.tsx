import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X, Pin } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { SkillList } from '@/components/skill/SkillList'
import { Pagination } from '@/components/common/Pagination'
import type { Skill, SkillListResponse } from '@/types/skill'

type TabType = 'hot' | 'trending' | 'top-rated' | 'most-downloaded'

interface FetchSkillsParams {
  tab: TabType
  page: number
  pageSize: number
  tag?: string
  q?: string
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

const fetchSkills = async (params: FetchSkillsParams): Promise<SkillListResponse> => {
  const { tab, page, pageSize, tag, q } = params
  const endpoint = TAB_ENDPOINTS[tab]

  const response = await apiClient.get<SkillListResponse>(endpoint, {
    params: {
      page,
      page_size: pageSize,
      ...(tag && { tag }),
      ...(q && { q }),
    },
  })

  return response.data
}

export function Home(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('hot')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const pageSize = 20

  const tagFilter = searchParams.get('tag') || undefined
  const searchQuery = searchParams.get('q') || undefined

  useEffect(() => {
    if (searchQuery) {
      setSearchInput(searchQuery)
    }
  }, [searchQuery])

  const { data, isLoading, error } = useQuery({
    queryKey: ['skills', activeTab, page, tagFilter, searchQuery],
    queryFn: () =>
      fetchSkills({
        tab: activeTab,
        page,
        pageSize,
        tag: tagFilter,
        q: searchQuery,
      }),
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
    const next = new URLSearchParams(searchParams)
    if (searchInput.trim()) {
      next.set('q', searchInput.trim())
    } else {
      next.delete('q')
    }
    setSearchParams(next)
    setPage(1)
  }, [searchInput, searchParams, setSearchParams])

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSearch()
    },
    [handleSearch]
  )

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next)
    setPage(1)
  }, [searchParams, setSearchParams])

  const handleClearTagFilter = useCallback(() => {
    const next = new URLSearchParams(searchParams)
    next.delete('tag')
    setSearchParams(next)
    setPage(1)
  }, [searchParams, setSearchParams])

  const handleSkillClick = useCallback((skill: Skill) => {
    window.location.href = `/skills/${skill.id}`
  }, [])

  const sortedSkills = data?.items
    ? [...data.items].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return 0
      })
    : []

  const errorMessage = error ? '加载失败，请稍后重试' : null

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8">
        <div
          className="relative flex items-center rounded-2xl"
          style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
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
            placeholder="搜索 Skills..."
            className="w-full pl-12 pr-12 py-3 bg-transparent outline-none"
            style={{ color: 'var(--text-primary)', fontSize: 15 }}
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 p-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-xl"
        style={{
          background: 'var(--card-bg)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--card-border)',
          display: 'inline-flex',
        }}
        role="tablist"
        aria-label="Tabs"
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
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
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

      {/* Active Filters */}
      {(tagFilter || searchQuery) && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            筛选:
          </span>
          {tagFilter && (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full"
              style={{
                background: 'rgba(59,130,246,0.1)',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(59,130,246,0.2)',
              }}
            >
              标签: {tagFilter}
              <button type="button" onClick={handleClearTagFilter} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full"
              style={{
                background: 'rgba(6,182,212,0.1)',
                color: 'var(--accent-secondary)',
                border: '1px solid rgba(6,182,212,0.2)',
              }}
            >
              搜索: {searchQuery}
              <button type="button" onClick={handleClearSearch} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Skill List */}
      <SkillList
        skills={sortedSkills}
        loading={isLoading}
        error={errorMessage}
        emptyText={
          searchQuery || tagFilter ? '没有找到相关 Skill，尝试其他关键词或标签' : '暂无 Skill'
        }
        onSkillClick={handleSkillClick}
        renderSkillCard={(skill) => (
          <div
            key={skill.id}
            data-testid="skill-card"
            data-pinned={skill.isPinned}
            className="relative rounded-2xl transition-all duration-400 cursor-pointer"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${skill.isPinned ? 'rgba(59,130,246,0.3)' : 'var(--card-border)'}`,
              boxShadow: 'var(--card-shadow)',
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
            {skill.isPinned && (
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
            {/* Card image area */}
            <div
              className="h-28 rounded-t-2xl flex items-center justify-center text-4xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(6,182,212,0.08) 100%)',
              }}
            >
              🤖
            </div>
            <div className="p-4">
              <h3
                className="text-sm font-semibold mb-2 line-clamp-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {skill.name}
              </h3>
              <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {skill.description}
              </p>
              <div
                className="flex items-center gap-3 text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <span>⭐ {(skill.ratingAvg ?? 0).toFixed(1)}</span>
                <span>↓ {skill.downloadCount ?? 0}</span>
                <span>♥ {skill.favoriteCount ?? 0}</span>
              </div>
              {(skill.tags ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
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
