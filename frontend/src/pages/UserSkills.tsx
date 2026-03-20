import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react'
import { apiClient } from '../lib/api'
import { Pagination } from '../components/common/Pagination'
import type { MySkillItem, PagedResponse } from '../types'

const SKILL_ICONS = ['🤖', '📊', '📝', '🔍', '⚡', '🎯', '🛠️', '📈', '🔮', '💡', '🧠', '🚀']
const getSkillIcon = (id: string): string => SKILL_ICONS[id.charCodeAt(0) % SKILL_ICONS.length]

export default function UserSkills(): JSX.Element {
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const PAGE_SIZE = 12

  const { data, isLoading, error } = useQuery<PagedResponse<MySkillItem>>({
    queryKey: ['my-skills', page],
    queryFn: async () => {
      const res = await apiClient.get<PagedResponse<MySkillItem>>('/users/me/skills', {
        params: { page, page_size: PAGE_SIZE },
      })
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/skills/${id}`),
    onSuccess: () => {
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['my-skills'] })
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
        <span className="text-4xl">📦</span>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          还没有上传任何 Skill
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--btn-gradient)' }}
        >
          <Plus size={16} />
          上传第一个 Skill
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
            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => navigate(`/skills/${skill.id}/edit`)}
                title="编辑"
                className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => setDeleteId(skill.id)}
                title="删除"
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

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
                <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>
                  {skill.description}
                </p>
                <div
                  className="flex items-center gap-3 text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span>⬇ {skill.download_count}</span>
                  <span>👁 {skill.view_count}</span>
                  <span>⭐ {parseFloat(skill.rating_avg).toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
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

      {/* Delete confirmation dialog */}
      {deleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-2xl"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              确认删除
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              确定要删除这个 Skill 吗？此操作无法撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-sm"
                style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}
              >
                取消
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
