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
  FolderOpen,
  MessageCircle,
  FileText,
  X,
  BookOpen,
  Target,
  Lightbulb,
  ImageIcon,
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
import { API_BASE_URL, apiClient } from '../lib/api'
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
  const [previewFile, setPreviewFile] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string>('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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
    mutationFn: async () => {
      const data = await downloadSkill(id!)
      // 使用相对路径，通过 Vite 代理访问后端，避免 CORS 问题
      // data.download_url 格式: /uploads/{skill_id}/{filename}
      const downloadUrl = data.download_url

      // 创建隐藏的 <a> 标签触发下载
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = '' // 让浏览器使用服务器提供的文件名
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return data
    },
    onSuccess: () => {
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

  // 获取文件内容
  const fetchFileContent = async (filePath: string) => {
    if (!id) return
    setIsPreviewLoading(true)
    try {
      const response = await apiClient.get(`/skills/${id}/files/${filePath}`)
      setPreviewContent(response.data.content)
      setPreviewFile(filePath)
      setShowPreview(true)
    } catch (error) {
      console.error('Failed to fetch file content:', error)
      setPreviewContent('无法加载文件内容')
      setShowPreview(true)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  // 处理文件点击
  const handleFileClick = (path: string) => {
    const lowerPath = path.toLowerCase()
    if (lowerPath.endsWith('.md') || lowerPath.endsWith('.txt') || lowerPath.endsWith('.json')) {
      fetchFileContent(path)
    }
  }

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
          <div className="h-8 rounded-lg w-1/3 bg-[var(--bg-muted)]" />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-muted)]" />
            <div className="h-4 rounded-lg w-24 bg-[var(--bg-muted)]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-4 rounded-lg w-full bg-[var(--bg-muted)]" />
              <div className="h-4 rounded-lg w-5/6 bg-[var(--bg-muted)]" />
              <div className="h-32 rounded-lg bg-[var(--bg-muted)]" />
            </div>
            <div className="space-y-4">
              <div className="h-40 rounded-lg bg-[var(--bg-muted)]" />
              <div className="h-20 rounded-lg bg-[var(--bg-muted)]" />
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
        <div className="text-center py-12 rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-[var(--text-primary)]">加载失败</h2>
          <p className="text-[var(--text-secondary)]">无法加载 Skill 详情，请稍后重试</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 px-5 py-2.5 rounded-lg text-white font-medium transition-colors hover:bg-[var(--accent-primary-hover)]"
            style={{ background: 'var(--accent-primary)' }}
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 头部信息 */}
      <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] p-6 mb-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Skill Icon */}
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-[var(--accent-subtle)] border border-[var(--border-emphasis)]">
            {getSkillIcon(skill.id)}
          </div>

          <div className="flex-1 min-w-0">
            {/* 标题 */}
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2">
              {skill.name}
            </h1>

            {/* 作者信息 */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[var(--accent-primary)]">
                {skill.author_username?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="font-medium text-[var(--text-primary)]">
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

      {/* 封面图片 */}
      {skill.cover_url && (
        <div className="rounded-xl overflow-hidden mb-6 border border-[var(--border-default)] shadow-sm">
          <img
            src={skill.cover_url}
            alt={skill.name}
            className="w-full aspect-video object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：详情内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 简介 */}
          <section className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <BookOpen size={18} className="text-[var(--accent-primary)]" />
              简介
            </h2>
            <MarkdownPreview content={skill.description} />
          </section>

          {/* 使用场景 */}
          {skill.usage_scenario && (
            <section className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                <Target size={18} className="text-[var(--accent-primary)]" />
                使用场景
              </h2>
              <MarkdownPreview content={skill.usage_scenario} />
            </section>
          )}

          {/* 使用方法 */}
          {skill.usage_method && (
            <section className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                <Lightbulb size={18} className="text-[var(--accent-primary)]" />
                使用方法
              </h2>
              <div className="rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-muted)] p-4">
                <MarkdownPreview content={skill.usage_method} />
              </div>
            </section>
          )}

          {/* 演示图片 */}
          {skill.demo_images && skill.demo_images.length > 0 && (
            <section className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                <ImageIcon size={18} className="text-[var(--accent-primary)]" />
                效果演示
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skill.demo_images.map((image, index) => (
                  <div
                    key={index}
                    className="rounded-lg overflow-hidden border border-[var(--border-default)]"
                  >
                    <img
                      src={`${API_BASE_URL}/files/${image.url}`}
                      alt={image.caption || `Demo ${index + 1}`}
                      className="w-full h-auto"
                    />
                    {image.caption && (
                      <p className="text-sm p-3 text-[var(--text-secondary)] bg-[var(--bg-subtle)]">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 文件树和预览 */}
          {skill.file_tree && skill.file_tree.length > 0 && (
            <section className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
                <FolderOpen size={18} className="text-[var(--accent-primary)]" />
                文件结构
              </h2>
              <div className="rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-muted)] p-4">
                <FileTree data={skill.file_tree} onFileClick={handleFileClick} />
              </div>

              {/* 文件预览区域 */}
              {showPreview && (
                <div className="mt-4">
                  <div className="flex items-center justify-between px-4 py-3 bg-[var(--accent-subtle)] border border-[var(--border-emphasis)] rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-[var(--accent-primary)]" />
                      <span className="text-[var(--text-primary)] font-medium">{previewFile}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#ef4444] transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="rounded-b-lg bg-[var(--bg-subtle)] border border-t-0 border-[var(--border-muted)] p-4 max-h-[500px] overflow-y-auto">
                    {isPreviewLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-[var(--accent-primary)]" />
                      </div>
                    ) : (
                      <MarkdownPreview content={previewContent} />
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 评论区 */}
          <section className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
              <MessageCircle size={18} className="text-[var(--accent-primary)]" />
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
          {/* 标签云卡片 */}
          {skill.tags.length > 0 && (
            <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] p-5 shadow-sm">
              <h3 className="text-sm font-medium mb-3 text-[var(--text-secondary)]">标签</h3>
              <div className="flex flex-wrap gap-2">
                {skill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--border-emphasis)] hover:bg-[var(--accent-muted)]"
                    onClick={() => navigate(`/search?tag=${encodeURIComponent(tag)}`)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 操作卡片 */}
          <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border-default)] p-6 shadow-sm space-y-5">
            {/* 下载按钮 */}
            <button
              type="button"
              data-testid="download-button"
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-colors hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent-primary)' }}
            >
              {downloadMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
              下载 ({formatFileSize(skill.file_size)})
            </button>

            {/* 评分区 */}
            <div className="pt-4 border-t border-[var(--border-default)]">
              <p className="text-sm mb-2 text-[var(--text-secondary)]">评分</p>
              <div className="flex items-center gap-3">
                <StarRating value={skill.user_rating || 0} readonly={false} onChange={handleRate} />
                <span className="text-2xl font-bold text-[var(--accent-primary)]">
                  {skill.rating_avg?.toFixed(1) || '0.0'}
                </span>
                <span className="text-sm text-[var(--text-tertiary)]">
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
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                skill.is_favorite
                  ? 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.3)] text-[#ef4444]'
                  : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-emphasis)] hover:text-[var(--text-primary)]'
              }`}
            >
              {favoriteMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Heart size={18} className={skill.is_favorite ? 'fill-current' : ''} />
              )}
              {skill.is_favorite ? '已收藏' : '收藏'}
              <span className="text-[var(--text-tertiary)]">({skill.favorite_count})</span>
            </button>

            {/* 统计信息 */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-[var(--border-default)]">
              <div className="rounded-lg p-3 text-center bg-[var(--bg-subtle)] border border-[var(--border-muted)]">
                <p className="text-lg font-bold text-[var(--accent-primary)]">{skill.view_count}</p>
                <p className="text-xs text-[var(--text-tertiary)]">浏览</p>
              </div>
              <div className="rounded-lg p-3 text-center bg-[var(--bg-subtle)] border border-[var(--border-muted)]">
                <p className="text-lg font-bold text-[var(--accent-primary)]">
                  {skill.download_count}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">下载</p>
              </div>
              <div className="rounded-lg p-3 text-center bg-[var(--bg-subtle)] border border-[var(--border-muted)]">
                <p className="text-lg font-bold text-[var(--accent-primary)]">
                  {skill.favorite_count}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">收藏</p>
              </div>
            </div>

            {/* 作者操作 */}
            {isAuthor && (
              <div className="pt-4 space-y-2 border-t border-[var(--border-default)]">
                <button
                  type="button"
                  data-testid="edit-button"
                  onClick={() => navigate(`/skills/${id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors bg-[var(--accent-subtle)] border border-[var(--border-emphasis)] text-[var(--accent-primary)] hover:bg-[var(--accent-muted)]"
                >
                  <Edit size={18} />
                  编辑
                </button>
                <button
                  type="button"
                  data-testid="delete-button"
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-colors bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] hover:bg-[rgba(239,68,68,0.15)]"
                >
                  <Trash2 size={18} />
                  删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteDialog && (
        <div
          data-testid="delete-confirm-dialog"
          className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-[rgba(0,0,0,0.5)]"
        >
          <div className="rounded-xl max-w-md w-full p-6 bg-[var(--card-bg)] border border-[var(--border-default)] shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(239,68,68,0.1)]">
                <AlertTriangle size={20} className="text-[#ef4444]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">确认删除</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-6">
              确定要删除这个 Skill 吗？此操作不可恢复。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                data-testid="cancel-delete-button"
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                取消
              </button>
              <button
                type="button"
                data-testid="confirm-delete-button"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-lg text-white transition-colors hover:bg-[#dc2626] disabled:opacity-50"
                style={{ background: '#ef4444' }}
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
