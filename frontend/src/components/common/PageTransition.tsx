import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
  children: React.ReactNode
}

/**
 * 页面切换过渡组件
 * 为页面内容添加淡入动画，支持路由变化时重新触发
 */
export function PageTransition({ children }: PageTransitionProps): JSX.Element {
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 路由变化时重置动画
    setIsVisible(false)
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })

    return () => cancelAnimationFrame(timer)
  }, [location.pathname])

  return (
    <div
      className="transition-all"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
        transitionDuration: isVisible ? 'var(--duration-slow)' : '0ms',
        transitionTimingFunction: 'var(--ease-out-quart)',
      }}
    >
      {children}
    </div>
  )
}
