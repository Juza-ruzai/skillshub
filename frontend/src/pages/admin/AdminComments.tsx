import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Loader2, AlertCircle } from 'lucide-react'
import { apiClient } from '../../lib/api'

interface AdminComment {
  id: string
  content: string
  skill_id: string
  skill_name: string
  user_id: string
  username: string
  is_deleted: boolean
  created_at: string | null
}

interface CommentsResponse {
  items: AdminComment[]
  total: number
  skip: number
  limit: number
}

const PAGE_SIZE = 20

export default function AdminComments(): JSX.Element {
  const [skip, setSkip] = useState(0)
  const [filterDeleted, setFilterDeleted] = useState<boolean | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<CommentsResponse>({
    queryKey: ['admin-comments', skip, filterDeleted],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = { skip, limit: PAGE_SIZE }
      if (filterDeleted !== null) params['is_deleted'] = filterDeleted
      const res = await apiClient.get<CommentsResponse>('/admin/comments', { params })
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/comments/${id}`),
    onSuccess: () => {
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
    },
  })

  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{
            background: 'var(--btn-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          评论管理
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          管理所有用户评论
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { label: '全部', value: null },
            { label: '正常', value: false },
            { label: '已删除', value: true },
          ] as const
        ).map((f) => (
          <button
            key={String(f.value)}
            onClick={() => {
              setFilterDeleted(f.value as boolean | null)
              setSkip(0)
            }}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={
              filterDeleted === f.value
                ? { background: 'var(--btn-gradient)', color: '#fff' }
                : { background: 'var(--card-border)', color: 'var(--text-muted)' }
            }
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-sm self-center" style={{ color: 'var(--text-muted)' }}>
          共 {total} 条
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
        </div>
      ) : error ? (
        <div
          className="flex items-center gap-3 p-4 rounded-xl"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <AlertCircle size={18} className="text-red-400" />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            加载失败，请刷新重试
          </span>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {data?.items.length === 0 ? (
            <div className="py-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              暂无评论数据
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
              {data?.items.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-4 p-4 hover:opacity-90 transition-opacity"
                >
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {comment.username}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        评论于
                      </span>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        {comment.skill_name}
                      </span>
                      {comment.is_deleted && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                          已删除
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                      {comment.content}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleString('zh-CN')
                        : '—'}
                    </p>
                  </div>

                  {/* Actions */}
                  {!comment.is_deleted && (
                    <button
                      onClick={() => setDeleteId(comment.id)}
                      title="删除评论"
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
            style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}
          >
            上一页
          </button>
          <span className="text-sm px-2" style={{ color: 'var(--text-muted)' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setSkip(skip + PAGE_SIZE)}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
            style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}
          >
            下一页
          </button>
        </div>
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
              确认删除评论
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              确定要删除这条评论吗？此操作将进行软删除。
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
