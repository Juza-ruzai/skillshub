import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, MessageCircle, AlertCircle, Loader2 } from 'lucide-react'
import { apiClient } from '../lib/api'
import { Pagination } from '../components/common/Pagination'
import type { MyCommentItem, PagedResponse } from '../types'

export default function UserComments(): JSX.Element {
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const PAGE_SIZE = 20

  const { data, isLoading, error } = useQuery<PagedResponse<MyCommentItem>>({
    queryKey: ['my-comments', page],
    queryFn: async () => {
      const res = await apiClient.get<PagedResponse<MyCommentItem>>('/users/me/comments', {
        params: { page, page_size: PAGE_SIZE },
      })
      return res.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/comments/${id}`),
    onSuccess: () => {
      setDeleteId(null)
      queryClient.invalidateQueries({ queryKey: ['my-comments'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl animate-pulse"
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
        <span className="text-4xl">💬</span>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          还没有发表任何评论
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--btn-gradient)' }}
        >
          去浏览 Skills
        </button>
      </div>
    )
  }

  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {items.map((comment) => (
          <div
            key={comment.id}
            className="group relative rounded-2xl p-4"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* Delete button */}
            <button
              onClick={() => setDeleteId(comment.id)}
              title="删除评论"
              className="absolute top-3 right-3 p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>

            {/* Header: skill name + date */}
            <div className="flex items-center gap-2 mb-2 pr-8">
              <MessageCircle size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <button
                onClick={() => navigate(`/skills/${comment.skill_id}`)}
                className="text-sm font-medium truncate hover:underline"
                style={{
                  background: 'var(--btn-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {comment.skill_name}
              </button>
              <span
                className="text-xs flex-shrink-0 ml-auto"
                style={{ color: 'var(--text-muted)' }}
              >
                {formatDate(comment.created_at)}
              </span>
            </div>

            {/* Comment content */}
            <p
              className="text-sm leading-relaxed line-clamp-3"
              style={{ color: 'var(--text-primary)' }}
            >
              {comment.content}
            </p>
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
              确认删除评论
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              确定要删除这条评论吗？此操作无法撤销。
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
