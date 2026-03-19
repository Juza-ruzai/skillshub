import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X, Pin } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { SkillList } from '@/components/skill/SkillList'
import { Pagination } from '@/components/common/Pagination'
import { Sidebar } from '@/components/layout/Sidebar'
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

  // Read URL params on mount
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
    if (searchInput.trim()) {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('q', searchInput.trim())
      setSearchParams(newParams)
    } else {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('q')
      setSearchParams(newParams)
    }
    setPage(1)
  }, [searchInput, searchParams, setSearchParams])

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch]
  )

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('q')
    setSearchParams(newParams)
    setPage(1)
  }, [searchParams, setSearchParams])

  const handleTagClick = useCallback(
    (tag: string) => {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('tag', tag)
      setSearchParams(newParams)
      setPage(1)
    },
    [searchParams, setSearchParams]
  )

  const handleClearTagFilter = useCallback(() => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('tag')
    setSearchParams(newParams)
    setPage(1)
  }, [searchParams, setSearchParams])

  const handleSkillClick = useCallback((skill: Skill) => {
    window.location.href = `/skills/${skill.id}`
  }, [])

  // Sort skills: pinned first
  const sortedSkills = data?.items
    ? [...data.items].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return 0
      })
    : []

  const errorMessage = error ? '加载失败，请稍后重试' : null

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">发现优质 AI Skills</h1>
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="搜索 Skills..."
              className="w-full px-4 py-3 pl-12 pr-12 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </nav>
            </div>

            {/* Active Filters */}
            {(tagFilter || searchQuery) && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">筛选条件:</span>
                {tagFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded">
                    标签: {tagFilter}
                    <button
                      type="button"
                      onClick={handleClearTagFilter}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-green-100 text-green-700 rounded">
                    搜索: {searchQuery}
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="hover:text-green-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    handleClearTagFilter()
                    handleClearSearch()
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  清除筛选
                </button>
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
                  className={`relative bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    skill.isPinned ? 'border-blue-300' : 'border-gray-200'
                  }`}
                  onClick={() => handleSkillClick(skill)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSkillClick(skill)
                  }}
                >
                  {skill.isPinned && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                        <Pin className="h-3 w-3" />
                        置顶
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{skill.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{skill.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        ⭐ {(skill.ratingAvg ?? 0).toFixed(1)}
                      </span>
                      <span>下载: {skill.downloadCount ?? 0}</span>
                      <span>收藏: {skill.favoriteCount ?? 0}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(skill.tags ?? []).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
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

          {/* Right Sidebar */}
          <aside className="w-full lg:w-64">
            <Sidebar onTagClick={handleTagClick} />
          </aside>
        </div>
      </div>
    </div>
  )
}
