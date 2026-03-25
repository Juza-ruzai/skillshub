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
  gradient = false,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  gradient?: boolean
}): JSX.Element {
  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-2xl"
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
        <span
          className="text-2xl font-bold"
          style={
            gradient
              ? {
                  background: 'var(--btn-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }
              : { color: 'var(--text-primary)' }
          }
        >
          {value}
        </span>
      </div>
      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{
            background: 'var(--btn-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
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
          gradient
        />
        <StatCard label="注册用户" value={data.total_users} icon={<Users size={20} />} gradient />
        <StatCard label="今日下载" value={data.today_downloads} icon={<Download size={20} />} />
        <StatCard label="今日评论" value={data.today_comments} icon={<MessageCircle size={20} />} />
        <StatCard label="今日上传" value={data.today_uploads} icon={<Upload size={20} />} />
      </div>
    </div>
  )
}
