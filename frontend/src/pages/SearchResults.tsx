import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X, ChevronLeft, Pin } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { getTags } from '@/lib/skillsApi'
import { TagCloud } from '@/components/common/TagCloud'
import { SkillList } from '@/components/skill/SkillList'
import { Pagination } from '@/components/common/Pagination'
import type { Skill, SkillListResponse } from '@/types/skill'

type SortType = 'hot_score' | 'rating' | 'download_count' | 'created_at'

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'hot_score', label: '综合热度' },
  { value: 'rating', label: '评分最高' },
  { value: 'download_count', label: '下载最多' },
  { value: 'created_at', label: '最新上传' },
]

const SKILL_ICONS = ['🤖', '📊', '📝', '🔍', '⚡', '🎯', '🛠️', '📈', '🔮', '💡', '🧠', '🚀']

const getSkillIcon = (id: string): string => {
  const index = id.charCodeAt(0) % SKILL_ICONS.length
  return SKILL_ICONS[index]
}

const fetchSearchResults = async (params: {
  q?: string
  tag?: string
  sort: SortType
  page: number
  pageSize: number
}): Promise<SkillListResponse> => {
  const response = await apiClient.get<SkillListResponse>('/skills', {
    params: {
      page: params.page,
      page_size: params.pageSize,
      sort_by: params.sort,
      ...(params.q && { search: params.q }),
      ...(params.tag && { tag: params.tag }),
    },
  })
  return response.data
}

export function SearchResults(): JSX.Element {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const q = searchParams.get('q') ?? ''
  const tag = searchParams.get('tag') ?? ''
  const sort = (searchParams.get('sort') as SortType) || 'hot_score'
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  const [searchInput, setSearchInput] = useState(q)

  // Sync search input when URL q changes
  useEffect(() => {
    setSearchInput(q)
  }, [q])

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams)
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
      }
      // Reset page when filters change
      if (!('page' in updates)) {
        next.set('page', '1')
      }
      navigate(`/search?${next.toString()}`, { replace: true })
    },
    [searchParams, navigate]
  )

  const handleSearch = useCallback(() => {
    const trimmed = searchInput.trim()
    updateParams({ q: trimmed || undefined })
  }, [searchInput, updateParams])

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSearch()
    },
    [handleSearch]
  )

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    updateParams({ q: undefined })
  }, [updateParams])

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateParams({ sort: e.target.value as SortType })
    },
    [updateParams]
  )

  const handleTagSelect = useCallback(
    (tagName: string) => {
      updateParams({ tag: tag === tagName ? undefined : tagName })
    },
    [tag, updateParams]
  )

  const handleClearTag = useCallback(() => {
    updateParams({ tag: undefined })
  }, [updateParams])

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateParams({ page: String(newPage) })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [updateParams]
  )

  const handleSkillClick = useCallback(
    (skill: Skill) => {
      navigate(`/skills/${skill.id}`)
    },
    [navigate]
  )

  const { data, isLoading, error } = useQuery({
    queryKey: ['search-results', q, tag, sort, page],
    queryFn: () =>
      fetchSearchResults({ q: q || undefined, tag: tag || undefined, sort, page, pageSize: 20 }),
  })

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    staleTime: 300_000,
  })

  const sortedSkills = data?.items
    ? [...data.items].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return 0
      })
    : []

  const errorMessage = error ? '加载失败，请稍后重试' : null

  return (
    <div>
      {/* ===== Breadcrumb ===== */}
      <div
        className="mb-6 flex items-center gap-2 text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Link
          to="/"
          className="flex items-center gap-1 hover:underline"
          style={{ color: 'var(--accent-primary)' }}
        >
          <ChevronLeft className="h-4 w-4" />
          返回首页
        </Link>
        <span>/</span>
        <span>搜索结果</span>
        {q && (
          <>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)' }}>{q}</span>
          </>
        )}
      </div>

      {/* ===== Search Box + Sort ===== */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div
          className="relative flex items-center rounded-2xl p-1.5 flex-1"
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
              onClick={handleClearSearch}
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

        {/* Sort Select */}
        <select
          value={sort}
          onChange={handleSortChange}
          className="px-4 py-2.5 rounded-2xl text-sm outline-none cursor-pointer"
          style={{
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--card-shadow)',
            minWidth: 120,
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* ===== Result Count ===== */}
      {data && (
        <div className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          共找到 <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{data.total}</span>{' '}
          个 Skill
          {q && (
            <>
              {' '}
              关键词「<span style={{ color: 'var(--accent-primary)' }}>{q}</span>」
            </>
          )}
          {tag && (
            <>
              {' '}
              标签「<span style={{ color: 'var(--accent-secondary)' }}>{tag}</span>」
            </>
          )}
        </div>
      )}

      {/* ===== Main Layout: List + Sidebar ===== */}
      <div className="flex gap-6">
        {/* Left: skill list */}
        <div className="flex-1 min-w-0">
          <SkillList
            skills={sortedSkills}
            loading={isLoading}
            error={errorMessage}
            emptyText={q || tag ? '没有找到相关 Skill，尝试其他关键词或标签' : '暂无 Skill'}
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
                {/* Cover image - 与首页保持一致 */}
                <div className="aspect-[16/10] rounded-t-2xl flex items-center justify-center text-5xl overflow-hidden bg-[var(--bg-subtle)]">
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
                <div className="p-4">
                  <h3
                    className="text-sm font-semibold mb-1.5 line-clamp-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {skill.name}
                  </h3>
                  <p
                    className="text-xs mb-3 line-clamp-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {skill.description}
                  </p>
                  <div
                    className="flex items-center gap-3 text-xs mb-3"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <span title="评分">⭐ {(skill.rating_avg ?? 0).toFixed(1)}</span>
                    <span title="下载">↓ {skill.download_count ?? 0}</span>
                    <span title="收藏">♥ {skill.favorite_count ?? 0}</span>
                  </div>
                  {(skill.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(skill.tags ?? []).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs rounded-full"
                          style={{
                            background:
                              t === tag ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.08)',
                            color: 'var(--accent-primary)',
                            border: `1px solid ${t === tag ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.15)'}`,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
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

        {/* Right: TagCloud sidebar */}
        {tags && tags.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0" aria-label="标签筛选">
            <div
              className="rounded-2xl p-4 sticky top-6"
              style={{
                background: 'var(--card-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                标签筛选
              </h3>
              <TagCloud
                tags={tags}
                selectedTags={tag ? [tag] : []}
                onTagSelect={handleTagSelect}
                onClear={tag ? handleClearTag : undefined}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
