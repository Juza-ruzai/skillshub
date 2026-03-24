import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Shield, ShieldOff, UserCheck, UserX, Loader2, AlertCircle } from 'lucide-react'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

interface AdminUser {
  id: string
  username: string
  email: string
  is_admin: boolean
  is_active: boolean
  created_at: string
}

const PAGE_SIZE = 20

export default function AdminUsers(): JSX.Element {
  const [search, setSearch] = useState('')
  const [skip, setSkip] = useState(0)
  const { user: currentUser } = useAuth()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, skip],
    queryFn: async () => {
      const res = await apiClient.get<{ items: AdminUser[]; total: number }>('/admin/users', {
        params: { search: search || undefined, skip, limit: PAGE_SIZE },
      })
      return res.data
    },
  })

  const adminMutation = useMutation({
    mutationFn: ({ id, is_admin }: { id: string; is_admin: boolean }) =>
      apiClient.patch(`/admin/users/${id}/admin`, { is_admin }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      apiClient.patch(`/admin/users/${id}/status`, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const cardStyle = {
    background: 'var(--card-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--card-border)',
    boxShadow: 'var(--card-shadow)',
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const page = Math.floor(skip / PAGE_SIZE) + 1

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{
            background: 'var(--btn-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          用户管理
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          管理平台注册用户
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setSkip(0)
          }}
          placeholder="搜索用户名或邮箱..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
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
                    borderBottom: '1px solid var(--card-border)',
                    background: 'var(--card-border)',
                  }}
                >
                  {['用户', '邮箱', '注册时间', '状态', '操作'].map((h) => (
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
                {items.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom:
                        i < items.length - 1 ? '1px solid var(--card-border)' : undefined,
                    }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'var(--btn-gradient)' }}
                        >
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {u.username}
                          </div>
                          {u.is_admin && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}
                            >
                              管理员
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={
                          u.is_active
                            ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
                            : { background: 'rgba(239,68,68,0.15)', color: '#ef4444' }
                        }
                      >
                        {u.is_active ? '正常' : '已禁用'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Can't modify yourself */}
                        {u.id !== currentUser?.id && (
                          <>
                            <button
                              title={u.is_admin ? '取消管理员' : '设为管理员'}
                              onClick={() =>
                                adminMutation.mutate({ id: u.id, is_admin: !u.is_admin })
                              }
                              disabled={adminMutation.isPending}
                              className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                              style={{ color: u.is_admin ? '#3b82f6' : 'var(--text-muted)' }}
                            >
                              {u.is_admin ? <Shield size={14} /> : <ShieldOff size={14} />}
                            </button>
                            <button
                              title={u.is_active ? '禁用账号' : '启用账号'}
                              onClick={() =>
                                statusMutation.mutate({ id: u.id, is_active: !u.is_active })
                              }
                              disabled={statusMutation.isPending}
                              className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                              style={{ color: u.is_active ? '#ef4444' : '#22c55e' }}
                            >
                              {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                          </>
                        )}
                        {u.id === currentUser?.id && (
                          <span
                            className="text-xs px-2 py-0.5 rounded"
                            style={{ color: 'var(--text-muted)', background: 'var(--card-border)' }}
                          >
                            当前用户
                          </span>
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            共 {total} 位用户
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSkip((s) => Math.max(0, s - PAGE_SIZE))}
              disabled={skip === 0}
              className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
              style={{ border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
            >
              上一页
            </button>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setSkip((s) => s + PAGE_SIZE)}
              disabled={skip + PAGE_SIZE >= total}
              className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40"
              style={{ border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
