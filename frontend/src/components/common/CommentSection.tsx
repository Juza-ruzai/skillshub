import { useState } from 'react'
import { Send, Trash2, CornerDownRight, Loader2 } from 'lucide-react'
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
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="py-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
            {comment.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-gray-900">{comment.username}</span>
              <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>

            <div className="mt-2 flex items-center gap-4">
              {currentUserId && (
                <button
                  type="button"
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                  aria-label="Reply"
                >
                  <CornerDownRight size={12} />
                  Reply
                </button>
              )}
              {isOwnComment && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                  aria-label="Delete comment"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              )}
            </div>

            {isReplying && (
              <div className="mt-3 flex gap-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 min-h-[60px] px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  type="button"
                  onClick={handleSubmitReply}
                  disabled={isSubmitting || !replyContent.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
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
        <Loader2 size={24} className="animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading comments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Comments ({comments.length})</h3>

      {currentUserId && (
        <div className="flex gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 min-h-[80px] px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-start"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Post Comment
          </button>
        </div>
      )}

      <div className="divide-y divide-gray-100">
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

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  )
}
