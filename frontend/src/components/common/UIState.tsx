import { Loader2, Inbox, AlertCircle, CheckCircle } from 'lucide-react'

interface BaseStateProps {
  message?: string
  className?: string
}

/**
 * 加载状态组件
 */
export function LoadingState({
  message = '加载中...',
  className = '',
}: BaseStateProps): JSX.Element {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      <p className="mt-3 text-sm text-[var(--text-secondary)]">{message}</p>
    </div>
  )
}

/**
 * 空状态组件
 */
export function EmptyState({
  message = '暂无数据',
  description,
  action,
  className = '',
}: BaseStateProps & { description?: string; action?: React.ReactNode }): JSX.Element {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[var(--bg-subtle)] border border-[var(--border-default)]">
        <Inbox className="w-8 h-8 text-[var(--text-tertiary)]" />
      </div>
      <p className="mt-4 text-base font-medium text-[var(--text-primary)]">{message}</p>
      {description && <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/**
 * 错误状态组件
 */
export function ErrorState({
  message = '加载失败',
  description,
  action,
  className = '',
}: BaseStateProps & { description?: string; action?: React.ReactNode }): JSX.Element {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
        <AlertCircle className="w-8 h-8 text-[#ef4444]" />
      </div>
      <p className="mt-4 text-base font-medium text-[var(--text-primary)]">{message}</p>
      {description && <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/**
 * 成功状态组件
 */
export function SuccessState({
  message = '操作成功',
  description,
  action,
  className = '',
}: BaseStateProps & { description?: string; action?: React.ReactNode }): JSX.Element {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[rgba(5,150,105,0.08)] border border-[rgba(5,150,105,0.2)]">
        <CheckCircle className="w-8 h-8 text-[#059669]" />
      </div>
      <p className="mt-4 text-base font-medium text-[var(--text-primary)]">{message}</p>
      {description && <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
