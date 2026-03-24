import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Loader2, TrendingUp } from 'lucide-react'
import { apiClient } from '../../lib/api'

interface ActiveUser {
  user_id: string
  username: string
  download_count: number
  comment_count: number
  upload_count: number
  total_score: number
}

interface ActiveUsersResponse {
  items: ActiveUser[]
  days: number
}

const DAYS_OPTIONS = [7, 30, 90] as const
type DaysOption = (typeof DAYS_OPTIONS)[number]

export default function AdminStats(): JSX.Element {
  const [days, setDays] = useState<DaysOption>(30)

  const { data, isLoading } = useQuery<ActiveUsersResponse>({
    queryKey: ['admin-active-users', days],
    queryFn: async () => {
      const res = await apiClient.get<ActiveUsersResponse>('/admin/stats/active-users', {
        params: { days, limit: 20 },
      })
      return res.data
    },
  })

  const downloadCSV = async (path: string, filename: string) => {
    const res = await apiClient.get(path, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportSkills = () => downloadCSV('/admin/export/skills', 'skills.csv')
  const handleExportUsers = () => downloadCSV('/admin/export/users', 'users.csv')
  const handleExportTags = () => downloadCSV('/admin/export/tags', 'tags.csv')

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            数据统计
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            活跃用户排行榜与数据导出
          </p>
        </div>
        {/* Export buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExportSkills}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-hover)]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <Download size={14} />
            导出 Skills
          </button>
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-hover)]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <Download size={14} />
            导出用户
          </button>
          <button
            onClick={handleExportTags}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-hover)]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <Download size={14} />
            导出标签
          </button>
        </div>
      </div>

      {/* Active Users Leaderboard */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Card header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
            <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              活跃用户榜单
            </span>
          </div>
          {/* Days filter */}
          <div className="flex gap-1">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                style={
                  days === d
                    ? { background: 'var(--accent-primary)', color: '#fff' }
                    : { background: 'transparent', color: 'var(--text-muted)' }
                }
              >
                {d}天
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              className="grid gap-2 px-4 py-2 text-xs font-medium"
              style={{
                color: 'var(--text-muted)',
                gridTemplateColumns: '2rem 1fr 5rem 5rem 5rem 5rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-hover)',
              }}
            >
              <span>#</span>
              <span>用户名</span>
              <span className="text-center">下载</span>
              <span className="text-center">评论</span>
              <span className="text-center">上传</span>
              <span className="text-center">总分</span>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {data?.items.length === 0 ? (
                <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  暂无数据
                </div>
              ) : (
                data?.items.map((user, idx) => (
                  <div
                    key={user.user_id}
                    className="grid gap-2 px-4 py-3 items-center text-sm hover:bg-[var(--bg-hover)] transition-colors"
                    style={{ gridTemplateColumns: '2rem 1fr 5rem 5rem 5rem 5rem' }}
                  >
                    <span
                      className="font-bold text-xs"
                      style={{
                        color:
                          idx < 3 ? 'var(--accent-primary)' : 'var(--text-muted)',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {user.username}
                    </span>
                    <span className="text-center" style={{ color: 'var(--text-secondary)' }}>
                      {user.download_count}
                    </span>
                    <span className="text-center" style={{ color: 'var(--text-secondary)' }}>
                      {user.comment_count}
                    </span>
                    <span className="text-center" style={{ color: 'var(--text-secondary)' }}>
                      {user.upload_count}
                    </span>
                    <span
                      className="text-center font-semibold"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {user.total_score}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
