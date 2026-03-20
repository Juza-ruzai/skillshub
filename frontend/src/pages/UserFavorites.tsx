import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, AlertCircle } from 'lucide-react'
import { apiClient } from '../lib/api'
import { Pagination } from '../components/common/Pagination'
import type { MySkillItem, PagedResponse } from '../types'

const SKILL_ICONS = ['🤖', '📊', '📝', '🔍', '⚡', '🎯', '🛠️', '📈', '🔮', '💡', '🧠', '🚀']
const getSkillIcon = (id: string): string => SKILL_ICONS[id.charCodeAt(0) % SKILL_ICONS.length]

export default function UserFavorites(): JSX.Element {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const PAGE_SIZE = 12

  const { data, isLoading, error } = useQuery<PagedResponse<MySkillItem>>({
    queryKey: ['my-favorites', page],
    queryFn: async () => {
      const res = await apiClient.get<PagedResponse<MySkillItem>>('/users/me/favorites', {
        params: { page, page_size: PAGE_SIZE },
      })
      return res.data
    },
  })

  const unfavoriteMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/skills/${id}/favorite`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-favorites'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-2xl animate-pulse"
            style={{ background: 'var(--card-border)' }}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <AlertCircle size={18} className="text-red-400" />
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          加载失败，请刷新重试
        </span>
      </div>
    )
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <span className="text-4xl">💝</span>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          还没有收藏任何 Skill
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--btn-gradient)' }}
        >
          去发现 Skills
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((skill) => (
          <div
            key={skill.id}
            className="relative group rounded-2xl p-4 transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* Unfavorite button */}
            <button
              onClick={() => unfavoriteMutation.mutate(skill.id)}
              disabled={unfavoriteMutation.isPending}
              title="取消收藏"
              className="absolute top-3 right-3 p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
            >
              <Heart size={14} fill="currentColor" />
            </button>

            {/* Card content */}
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{getSkillIcon(skill.id)}</span>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-sm truncate mb-1 cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => navigate(`/skills/${skill.id}`)}
                >
                  {skill.name}
                </h3>
                <p className="text-xs mb-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                  by {skill.author_username}
                </p>
                <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
                  {skill.description}
                </p>
                <div
                  className="flex items-center gap-3 text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span>⬇ {skill.download_count}</span>
                  <span>⭐ {parseFloat(skill.rating_avg).toFixed(1)}</span>
                </div>
              </div>
            </div>

            {skill.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {skill.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {total > PAGE_SIZE && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / PAGE_SIZE)}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
