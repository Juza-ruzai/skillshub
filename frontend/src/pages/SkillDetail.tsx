import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, Heart, Edit, Trash2, Eye, Calendar, Loader2, AlertTriangle } from 'lucide-react'
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
import { getSkillComments, postComment } from '../lib/commentsApi'
import { API_BASE_URL } from '../lib/api'
import type { CommentCreate } from '../types/comment'

export default function SkillDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
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
      // 触发文件下载
      window.open(data.url, '_blank')
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

  // 判断是否作者
  const isAuthor = user?.id === skill?.authorId

  // 处理评分
  const handleRate = (score: number) => {
    if (!user) return
    rateMutation.mutate(score)
  }

  // 处理收藏
  const handleToggleFavorite = () => {
    if (!user) return
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

  // 骨架屏
  if (isLoadingSkill) {
    return (
      <div data-testid="skill-detail-skeleton" className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {/* 标题骨架 */}
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          {/* 作者信息骨架 */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          {/* 内容骨架 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-40 bg-gray-200 rounded" />
              <div className="h-20 bg-gray-200 rounded" />
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
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">加载失败</h2>
          <p className="text-gray-500 mt-2">无法加载 Skill 详情，请稍后重试</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 头部信息 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{skill.name}</h1>

        {/* 作者信息 */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
            {skill.authorUsername?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{skill.authorUsername}</p>
            <div className="flex items-center gap-4 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(skill.createdAt).toLocaleDateString('zh-CN')}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {skill.viewCount} 浏览
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：详情内容 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 描述 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">简介</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{skill.description}</p>
          </section>

          {/* 使用场景 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">使用场景</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{skill.usageScenario}</p>
          </section>

          {/* 使用方法 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">使用方法</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <MarkdownPreview content={skill.usageMethod} />
            </div>
          </section>

          {/* 演示图片 */}
          {skill.demoImages && skill.demoImages.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">效果演示</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skill.demoImages.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={`${API_BASE_URL}/files/${image.url}`}
                      alt={image.caption || `Demo ${index + 1}`}
                      className="w-full h-auto"
                    />
                    {image.caption && (
                      <p className="text-sm text-gray-600 p-2 bg-gray-50">{image.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 文件树 */}
          {skill.fileTree && skill.fileTree.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">文件结构</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <FileTree data={skill.fileTree} />
              </div>
            </section>
          )}

          {/* 标签 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">标签</h2>
            <div className="flex flex-wrap gap-2">
              {skill.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* 评论区 */}
          <section>
            <CommentSection
              comments={commentsData?.items || []}
              currentUserId={user?.id}
              isLoading={isLoadingComments}
              onSubmitComment={handleSubmitComment}
            />
            {!user && <p className="text-center text-gray-500 mt-4">登录后发表评论</p>}
          </section>
        </div>

        {/* 右侧：互动区 */}
        <div className="space-y-6">
          {/* 操作按钮 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            {/* 下载按钮 */}
            <button
              type="button"
              data-testid="download-button"
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {downloadMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Download size={20} />
              )}
              下载 ({formatFileSize(skill.fileSize)})
            </button>

            {/* 评分 */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-2">评分</p>
              <div className="flex items-center gap-3">
                <StarRating value={skill.userRating || 0} readonly={!user} onChange={handleRate} />
                <span className="text-lg font-semibold text-gray-900">{skill.ratingAvg}</span>
                <span className="text-sm text-gray-500">({skill.ratingCount} 评分)</span>
              </div>
            </div>

            {/* 收藏按钮 */}
            <button
              type="button"
              data-testid="favorite-button"
              data-favorited={skill.isFavorite}
              onClick={handleToggleFavorite}
              disabled={!user || favoriteMutation.isPending}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                skill.isFavorite
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {favoriteMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Heart size={18} className={skill.isFavorite ? 'fill-current' : ''} />
              )}
              {skill.isFavorite ? '已收藏' : '收藏'}
              <span className="text-gray-500">({skill.favoriteCount})</span>
            </button>

            {/* 统计信息 */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-gray-900">{skill.viewCount}</p>
                <p className="text-xs text-gray-500">浏览</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{skill.downloadCount}</p>
                <p className="text-xs text-gray-500">下载</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{skill.favoriteCount}</p>
                <p className="text-xs text-gray-500">收藏</p>
              </div>
            </div>

            {/* 作者操作 */}
            {isAuthor && (
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <button
                  type="button"
                  data-testid="edit-button"
                  onClick={() => navigate(`/skills/${id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit size={18} />
                  编辑
                </button>
                <button
                  type="button"
                  data-testid="delete-button"
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                  删除
                </button>
              </div>
            )}
          </div>

          {/* 评论数量 */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{commentsData?.total || 0}</p>
            <p className="text-sm text-gray-600">条评论</p>
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteDialog && (
        <div
          data-testid="delete-confirm-dialog"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
            </div>
            <p className="text-gray-600 mb-6">确定要删除这个 Skill 吗？此操作不可恢复。</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                data-testid="cancel-delete-button"
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                data-testid="confirm-delete-button"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
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
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
