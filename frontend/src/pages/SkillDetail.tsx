import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Download,
  Heart,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Loader2,
  AlertTriangle,
  Sparkles,
  FolderOpen,
  MessageCircle,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { StarRating } from '../components/common/StarRating'
import { FileTree } from '../components/skill/FileTree'
import { MarkdownPreview } from '../components/common/MarkdownPreview'
import { CommentSection } from '../components/common/CommentSection'
import {
  getSkillDetail,
  rateSkill,
  toggleFavorite,
  downloadSkill,
  deleteSkill,
} from '../lib/skillsApi'
import { getSkillComments, postComment, deleteComment } from '../lib/commentsApi'
import { API_BASE_URL } from '../lib/api'
import type { CommentCreate } from '../types/comment'

// Skill icon emoji pool
const SKILL_ICONS = ['🤖', '📊', '📝', '🔍', '⚡', '🎯', '🛠️', '📈', '🔮', '💡', '🧠', '🚀']

const getSkillIcon = (id: string): string => {
  const index = id.charCodeAt(0) % SKILL_ICONS.length
  return SKILL_ICONS[index]
}

export default function SkillDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // 获取 Skill 详情
  const {
    data: skill,
    isLoading: isLoadingSkill,
    error: skillError,
  } = useQuery({
    queryKey: ['skill', id],
    queryFn: () => getSkillDetail(id!),
    enabled: !!id,
  })

  // 获取评论列表
  const { data: commentsData, isLoading: isLoadingComments } = useQuery({
    queryKey: ['skill-comments', id],
    queryFn: () => getSkillComments(id!),
    enabled: !!id,
  })

  // 评分 mutation
  const rateMutation = useMutation({
    mutationFn: (score: number) => rateSkill(id!, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill', id] })
    },
  })

  // 收藏 mutation
  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavorite(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill', id] })
    },
  })

  // 下载 mutation
  const downloadMutation = useMutation({
    mutationFn: () => downloadSkill(id!),
    onSuccess: (data) => {
      const fullUrl = `${new URL(API_BASE_URL).origin}${data.download_url}`
      const link = document.createElement('a')
      link.href = fullUrl
      link.setAttribute('download', '')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      queryClient.invalidateQueries({ queryKey: ['skill', id] })
    },
  })

  // 删除 mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteSkill(id!),
    onSuccess: () => {
      navigate('/')
    },
  })

  // 发表评论 mutation
  const commentMutation = useMutation({
    mutationFn: (data: CommentCreate) => postComment(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-comments', id] })
    },
  })

  // 删除评论 mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-comments', id] })
    },
  })

  // 判断是否作者
  const isAuthor = user?.id === skill?.author_id

  // 处理评分
  const handleRate = (score: number) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } })
      return
    }
    rateMutation.mutate(score)
  }

  // 处理收藏
  const handleToggleFavorite = () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } })
      return
    }
    favoriteMutation.mutate()
  }

  // 处理下载
  const handleDownload = () => {
    downloadMutation.mutate()
  }

  // 处理删除
  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    deleteMutation.mutate()
    setShowDeleteDialog(false)
  }

  // 处理发表评论
  const handleSubmitComment = async (data: CommentCreate) => {
    await commentMutation.mutateAsync(data)
  }

  // 处理删除评论
  const handleDeleteComment = async (commentId: string) => {
    await deleteCommentMutation.mutateAsync(commentId)
  }

  // 骨架屏
  if (isLoadingSkill) {
    return (
      <div data-testid="skill-detail-skeleton" className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 rounded w-1/3" style={{ background: 'var(--card-bg)' }} />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full" style={{ background: 'var(--card-bg)' }} />
            <div className="h-4 rounded w-24" style={{ background: 'var(--card-bg)' }} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-4 rounded w-full" style={{ background: 'var(--card-bg)' }} />
              <div className="h-4 rounded w-5/6" style={{ background: 'var(--card-bg)' }} />
              <div className="h-32 rounded" style={{ background: 'var(--card-bg)' }} />
            </div>
            <div className="space-y-4">
              <div className="h-40 rounded" style={{ background: 'var(--card-bg)' }} />
              <div className="h-20 rounded" style={{ background: 'var(--card-bg)' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (skillError || !skill) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div
          className="text-center py-12 rounded-2xl"
          style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--card-border)',
          }}
        >
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            加载失败
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>无法加载 Skill 详情，请稍后重试</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 rounded-xl text-white transition-all duration-300 hover:scale-105"
            style={{ background: 'var(--btn-gradient)' }}
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 头部信息 - 玻璃拟态卡片 */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div className="flex items-start gap-4">
          {/* Skill Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(6,182,212,0.1) 100%)',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            {getSkillIcon(skill.id)}
          </div>

          <div className="flex-1 min-w-0">
            {/* 标题 - 渐变效果 */}
            <h1
              className="text-2xl md:text-3xl font-bold mb-2"
              style={{
                background: 'var(--btn-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
              }}
            >
              {skill.name}
            </h1>

            {/* 作者信息 */}
            <div
              className="flex flex-wrap items-center gap-3 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'var(--btn-gradient)' }}
              >
                {skill.author_username?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {skill.author_username}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(skill.created_at).toLocaleDateString('zh-CN')}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {skill.view_count} 浏览
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：详情内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 简介 */}
          <section
            className="rounded-2xl p-6"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-3 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
              简介
            </h2>
            <p style={{ color: 'var(--text-secondary)' }} className="whitespace-pre-wrap">
              {skill.description}
            </p>
          </section>

          {/* 使用场景 */}
          {skill.usage_scenario && (
            <section
              className="rounded-2xl p-6"
              style={{
                background: 'var(--card-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <h2
                className="text-lg font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                使用场景
              </h2>
              <p style={{ color: 'var(--text-secondary)' }} className="whitespace-pre-wrap">
                {skill.usage_scenario}
              </p>
            </section>
          )}

          {/* 使用方法 */}
          {skill.usage_method && (
            <section
              className="rounded-2xl p-6"
              style={{
                background: 'var(--card-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <h2
                className="text-lg font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                使用方法
              </h2>
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <MarkdownPreview content={skill.usage_method} />
              </div>
            </section>
          )}

          {/* 演示图片 */}
          {skill.demo_images && skill.demo_images.length > 0 && (
            <section
              className="rounded-2xl p-6"
              style={{
                background: 'var(--card-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
                效果演示
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skill.demo_images.map((image, index) => (
                  <div
                    key={index}
                    className="rounded-xl overflow-hidden"
                    style={{
                      border: '1px solid var(--card-border)',
                    }}
                  >
                    <img
                      src={`${API_BASE_URL}/files/${image.url}`}
                      alt={image.caption || `Demo ${index + 1}`}
                      className="w-full h-auto"
                    />
                    {image.caption && (
                      <p
                        className="text-sm p-3"
                        style={{
                          color: 'var(--text-secondary)',
                          background: 'rgba(255,255,255,0.03)',
                        }}
                      >
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 文件树 */}
          {skill.file_tree && skill.file_tree.length > 0 && (
            <section
              className="rounded-2xl p-6"
              style={{
                background: 'var(--card-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <FolderOpen size={18} style={{ color: 'var(--accent-primary)' }} />
                文件结构
              </h2>
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <FileTree data={skill.file_tree} />
              </div>
            </section>
          )}

          {/* 标签 */}
          <section
            className="rounded-2xl p-6"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              标签
            </h2>
            <div className="flex flex-wrap gap-2">
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-sm transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'rgba(59,130,246,0.1)',
                    color: 'var(--accent-primary)',
                    border: '1px solid rgba(59,130,246,0.2)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* 评论区 */}
          <section
            className="rounded-2xl p-6"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <MessageCircle size={18} style={{ color: 'var(--accent-primary)' }} />
              评论 ({commentsData?.length || 0})
            </h2>
            <CommentSection
              comments={commentsData || []}
              currentUserId={user?.id}
              isLoading={isLoadingComments}
              onSubmitComment={handleSubmitComment}
              onDeleteComment={handleDeleteComment}
            />
          </section>
        </div>

        {/* 右侧：互动区 */}
        <div className="space-y-6">
          {/* 操作卡片 */}
          <div
            className="rounded-2xl p-6 space-y-5"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            {/* 下载按钮 - 渐变 */}
            <button
              type="button"
              data-testid="download-button"
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--btn-gradient)',
                boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
              }}
            >
              {downloadMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
              下载 ({formatFileSize(skill.file_size)})
            </button>

            {/* 评分区 */}
            <div className="pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                评分
              </p>
              <div className="flex items-center gap-3">
                <StarRating value={skill.user_rating || 0} readonly={false} onChange={handleRate} />
                <span
                  className="text-2xl font-bold"
                  style={{
                    background: 'var(--btn-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {skill.rating_avg?.toFixed(1) || '0.0'}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  ({skill.rating_count} 评分)
                </span>
              </div>
            </div>

            {/* 收藏按钮 */}
            <button
              type="button"
              data-testid="favorite-button"
              data-favorited={skill.is_favorite}
              onClick={handleToggleFavorite}
              disabled={favoriteMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: skill.is_favorite ? 'rgba(239,68,68,0.08)' : 'transparent',
                borderColor: skill.is_favorite ? 'rgba(239,68,68,0.3)' : 'var(--card-border)',
                color: skill.is_favorite ? '#ef4444' : 'var(--text-secondary)',
              }}
            >
              {favoriteMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Heart size={18} className={skill.is_favorite ? 'fill-current' : ''} />
              )}
              {skill.is_favorite ? '已收藏' : '收藏'}
              <span style={{ color: 'var(--text-tertiary)' }}>({skill.favorite_count})</span>
            </button>

            {/* 统计信息 - 玻璃拟态卡片 */}
            <div
              className="pt-4 grid grid-cols-3 gap-3"
              style={{ borderTop: '1px solid var(--card-border)' }}
            >
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <p
                  className="text-lg font-bold"
                  style={{
                    background: 'var(--btn-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {skill.view_count}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  浏览
                </p>
              </div>
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <p
                  className="text-lg font-bold"
                  style={{
                    background: 'var(--btn-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {skill.download_count}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  下载
                </p>
              </div>
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <p
                  className="text-lg font-bold"
                  style={{
                    background: 'var(--btn-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {skill.favorite_count}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  收藏
                </p>
              </div>
            </div>

            {/* 作者操作 */}
            {isAuthor && (
              <div className="pt-4 space-y-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                <button
                  type="button"
                  data-testid="edit-button"
                  onClick={() => navigate(`/skills/${id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <Edit size={18} />
                  编辑
                </button>
                <button
                  type="button"
                  data-testid="delete-button"
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#ef4444',
                  }}
                >
                  <Trash2 size={18} />
                  删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 删除确认对话框 - 玻璃拟态 */}
      {showDeleteDialog && (
        <div
          data-testid="delete-confirm-dialog"
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="rounded-2xl max-w-md w-full p-6"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.1)' }}
              >
                <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                确认删除
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }} className="mb-6">
              确定要删除这个 Skill 吗？此操作不可恢复。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                data-testid="cancel-delete-button"
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 rounded-xl transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                取消
              </button>
              <button
                type="button"
                data-testid="confirm-delete-button"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl text-white transition-all duration-200 hover:scale-105 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)' }}
              >
                {deleteMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  '确认删除'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 辅助函数：格式化文件大小
function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
