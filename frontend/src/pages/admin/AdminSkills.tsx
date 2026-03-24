import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Edit,
  Trash2,
  Pin,
  RotateCcw,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { apiClient } from '../../lib/api'

const SKILL_ICONS = ['🤖', '📊', '📝', '🔍', '⚡', '🎯', '🛠️', '📈', '🔮', '💡', '🧠', '🚀']
const getSkillIcon = (id: string) => SKILL_ICONS[id.charCodeAt(0) % SKILL_ICONS.length]

interface SkillItem {
  id: string
  name: string
  description: string
  tags: string[]
  author_id: string
  author_username?: string
  download_count: number
  rating_avg: string
  rating_count: number
  created_at: string
  is_pinned?: boolean
  is_deleted?: boolean
}

interface DownloadUser {
  user_id: string
  username: string
  downloaded_at: string
}

const PAGE_SIZE = 20

export default function AdminSkills(): JSX.Element {
  const [tab, setTab] = useState<'active' | 'deleted'>('active')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadsId, setDownloadsId] = useState<string | null>(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  // Active skills
  const { data: activeData, isLoading: activeLoading } = useQuery({
    queryKey: ['admin-skills-active', page],
    queryFn: async () => {
      const res = await apiClient.get<{ items: SkillItem[]; total: number }>('/skills', {
        params: { page, page_size: PAGE_SIZE },
      })
      return res.data
    },
    enabled: tab === 'active',
  })

  // Deleted skills
  const { data: deletedData, isLoading: deletedLoading } = useQuery({
    queryKey: ['admin-skills-deleted'],
    queryFn: async () => {
      const res = await apiClient.get<{ items: SkillItem[]; total: number }>(
        '/admin/skills/deleted',
        {
          params: { skip: 0, limit: 50 },
        }
      )
      return res.data
    },
    enabled: tab === 'deleted',
  })

  // Downloads modal data
  const { data: downloadsData } = useQuery({
    queryKey: ['admin-skill-downloads', downloadsId],
    queryFn: async () => {
      const res = await apiClient.get<{ items: DownloadUser[] }>(
        `/admin/skills/${downloadsId}/downloads`
      )
      return res.data
    },
    enabled: !!downloadsId,
  })

  const pinMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/skills/${id}/pin`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-skills-active'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/skills/${id}`),
    onSuccess: () => {
      setDeletingId(null)
      qc.invalidateQueries({ queryKey: ['admin-skills-active'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/skills/${id}/restore`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-skills-deleted'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    },
  })

  const items = tab === 'active' ? (activeData?.items ?? []) : (deletedData?.items ?? [])
  const total = tab === 'active' ? (activeData?.total ?? 0) : (deletedData?.total ?? 0)
  const isLoading = tab === 'active' ? activeLoading : deletedLoading
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Skill 管理
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          管理平台所有 Skills
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
      >
        {(['active', 'deleted'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t)
              setPage(1)
            }}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={
              tab === t
                ? { background: 'var(--accent-primary)', color: '#fff' }
                : { color: 'var(--text-secondary)' }
            }
          >
            {t === 'active' ? '正常' : '已删除'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <AlertCircle size={28} style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              暂无数据
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'var(--bg-hover)',
                  }}
                >
                  {['Skill', '作者', '下载', '评分', '创建时间', '操作'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((skill, i) => (
                  <tr
                    key={skill.id}
                    style={{
                      borderBottom:
                        i < items.length - 1 ? '1px solid var(--border-subtle)' : undefined,
                    }}
                    className="hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{getSkillIcon(skill.id)}</span>
                        <div>
                          <div
                            className="font-medium truncate max-w-[180px]"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {skill.name}
                            {skill.is_pinned && (
                              <span className="ml-1 text-xs text-yellow-500">📌</span>
                            )}
                          </div>
                          <div
                            className="text-xs truncate max-w-[180px]"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {(skill.tags ?? []).slice(0, 2).join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {skill.author_username ?? '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {skill.download_count}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {parseFloat(skill.rating_avg ?? '0').toFixed(1)} ⭐
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(skill.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {tab === 'active' ? (
                          <>
                            <button
                              title="置顶/取消置顶"
                              onClick={() => pinMutation.mutate(skill.id)}
                              disabled={pinMutation.isPending}
                              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                              style={{ color: skill.is_pinned ? '#eab308' : 'var(--text-muted)' }}
                            >
                              <Pin size={14} />
                            </button>
                            <button
                              title="编辑"
                              onClick={() => navigate(`/skills/${skill.id}/edit`)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                              style={{ color: 'var(--accent-primary)' }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              title="查看下载用户"
                              onClick={() => setDownloadsId(skill.id)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              <Users size={14} />
                            </button>
                            <button
                              title="强制删除"
                              onClick={() => setDeletingId(skill.id)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                              style={{ color: '#ef4444' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <button
                            title="恢复"
                            onClick={() => restoreMutation.mutate(skill.id)}
                            disabled={restoreMutation.isPending}
                            className="p-1.5 rounded-lg transition-colors hover:bg-green-500/10"
                            style={{ color: '#22c55e' }}
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {tab === 'active' && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            共 {total} 条
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg disabled:opacity-40 transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm px-3" style={{ color: 'var(--text-primary)' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg disabled:opacity-40 transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deletingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setDeletingId(null)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-xl"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              确认强制删除
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              此操作将物理删除 Skill，无法恢复。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                取消
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingId)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downloads Modal */}
      {downloadsId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setDownloadsId(null)}
        >
          <div
            className="w-full max-w-md p-6 rounded-xl max-h-[80vh] overflow-y-auto"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              下载用户列表
            </h3>
            {!downloadsData ? (
              <div className="flex justify-center py-8">
                <Loader2
                  size={24}
                  className="animate-spin"
                  style={{ color: 'var(--text-muted)' }}
                />
              </div>
            ) : downloadsData.items.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                暂无下载记录
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {downloadsData.items.map((u) => (
                  <div
                    key={u.user_id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: 'var(--bg-hover)' }}
                  >
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {u.username}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(u.downloaded_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setDownloadsId(null)}
              className="mt-4 w-full py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
