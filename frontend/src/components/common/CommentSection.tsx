import { useState } from 'react'
import { Send, Trash2, CornerDownRight, Loader2, MessageSquare } from 'lucide-react'
import type { CommentWithReplies, CommentCreate } from '@/types/comment'

export interface CommentSectionProps {
  comments: CommentWithReplies[]
  currentUserId?: string
  isLoading?: boolean
  onSubmitComment: (data: CommentCreate) => Promise<void>
  onDeleteComment?: (commentId: string) => Promise<void>
}

interface CommentItemProps {
  comment: CommentWithReplies
  currentUserId?: string
  onReply: (parentId: string, content: string) => Promise<void>
  onDelete?: (commentId: string) => Promise<void>
  depth?: number
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  depth = 0,
}: CommentItemProps): JSX.Element {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOwnComment = currentUserId === comment.userId

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return
    setIsSubmitting(true)
    await onReply(comment.id, replyContent)
    setReplyContent('')
    setIsReplying(false)
    setIsSubmitting(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div
      className={`${depth > 0 ? 'ml-6 pl-4' : ''}`}
      style={depth > 0 ? { borderLeft: '1px solid var(--card-border)' } : {}}
    >
      <div className="py-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'var(--btn-gradient)' }}
          >
            {comment.username.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                {comment.username}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {/* Content */}
            <p
              className="mt-1 text-sm whitespace-pre-wrap"
              style={{ color: 'var(--text-secondary)' }}
            >
              {comment.content}
            </p>

            {/* Actions */}
            <div className="mt-2 flex items-center gap-4">
              {currentUserId && (
                <button
                  type="button"
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-xs flex items-center gap-1 transition-colors duration-150"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)'
                  }}
                  aria-label="Reply"
                >
                  <CornerDownRight size={12} />
                  回复
                </button>
              )}
              {isOwnComment && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="text-xs flex items-center gap-1 transition-colors duration-150"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)'
                  }}
                  aria-label="Delete comment"
                >
                  <Trash2 size={12} />
                  删除
                </button>
              )}
            </div>

            {/* Reply Input */}
            {isReplying && (
              <div className="mt-3 flex gap-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="写下你的回复..."
                  className="flex-1 min-h-[60px] px-3 py-2 text-sm rounded-xl outline-none transition-all duration-200 resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--card-border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleSubmitReply}
                  disabled={isSubmitting || !replyContent.trim()}
                  className="px-3 py-2 rounded-xl text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--btn-gradient)' }}
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentSection({
  comments,
  currentUserId,
  isLoading,
  onSubmitComment,
  onDeleteComment,
}: CommentSectionProps): JSX.Element {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    setIsSubmitting(true)
    await onSubmitComment({ content: newComment })
    setNewComment('')
    setIsSubmitting(false)
  }

  const handleReply = async (parentId: string, content: string) => {
    await onSubmitComment({ content, parentId })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>
          加载评论...
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* New Comment Input */}
      {currentUserId && (
        <div
          className="flex gap-3 p-4 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--card-border)',
          }}
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="发表你的评论..."
            className="flex-1 min-h-[80px] px-4 py-3 text-sm rounded-xl outline-none transition-all duration-200 resize-none bg-transparent"
            style={{
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 text-white text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-start"
            style={{ background: 'var(--btn-gradient)' }}
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            发表评论
          </button>
        </div>
      )}

      {/* Comments List */}
      <div>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            onReply={handleReply}
            onDelete={onDeleteComment}
          />
        ))}
      </div>

      {/* Empty State */}
      {comments.length === 0 && (
        <div className="text-center py-8 rounded-xl" style={{ color: 'var(--text-tertiary)' }}>
          <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
          <p>暂无评论，来发表第一条评论吧！</p>
        </div>
      )}

      {/* Login Prompt */}
      {!currentUserId && (
        <div
          className="text-center py-4 px-4 rounded-xl mt-4"
          style={{
            background: 'rgba(59,130,246,0.05)',
            border: '1px dashed rgba(59,130,246,0.2)',
            color: 'var(--text-secondary)',
          }}
        >
          <p className="text-sm">登录后即可发表评论参与讨论</p>
        </div>
      )}
    </div>
  )
}
