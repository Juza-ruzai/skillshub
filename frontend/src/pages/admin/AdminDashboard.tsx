import { useQuery } from '@tanstack/react-query'
import { BookOpen, Users, Download, MessageCircle, Upload, Loader2 } from 'lucide-react'
import { apiClient } from '../../lib/api'

interface OverviewStats {
  total_skills: number
  total_users: number
  today_downloads: number
  today_comments: number
  today_uploads: number
}

function StatCard({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  accent?: boolean
}): JSX.Element {
  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-xl"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          style={accent ? { color: 'var(--accent-primary)' } : { color: 'var(--text-muted)' }}
        >
          {icon}
        </span>
        <span
          className="text-2xl font-bold"
          style={accent ? { color: 'var(--accent-primary)' } : { color: 'var(--text-primary)' }}
        >
          {value}
        </span>
      </div>
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
    </div>
  )
}

export default function AdminDashboard(): JSX.Element {
  const { data, isLoading } = useQuery<OverviewStats>({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const res = await apiClient.get<OverviewStats>('/admin/stats/overview')
      return res.data
    },
  })

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          平台概览
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          实时平台运营数据
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Skill 总数"
          value={data.total_skills}
          icon={<BookOpen size={20} />}
          accent
        />
        <StatCard
          label="注册用户"
          value={data.total_users}
          icon={<Users size={20} />}
          accent
        />
        <StatCard label="今日下载" value={data.today_downloads} icon={<Download size={20} />} />
        <StatCard label="今日评论" value={data.today_comments} icon={<MessageCircle size={20} />} />
        <StatCard label="今日上传" value={data.today_uploads} icon={<Upload size={20} />} />
      </div>
    </div>
  )
}
