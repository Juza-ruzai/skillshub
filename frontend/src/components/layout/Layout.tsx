import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  selectedTag?: string
  onTagSelect?: (tag: string) => void
  onSearch?: (keyword: string) => void
  unreadCount?: number
}

export const Layout = ({
  selectedTag,
  onTagSelect,
  onSearch,
  unreadCount = 0,
}: LayoutProps): JSX.Element => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background glow orbs */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '10%',
          left: '15%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'var(--bg-glow-1)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'bgPulse 12s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '15%',
          right: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'var(--bg-glow-2)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'bgPulse 12s ease-in-out infinite 6s',
        }}
      />

      {/* Content layer */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
        <Header onSearch={onSearch} unreadCount={unreadCount} />

        <div className="flex-1 container mx-auto px-4 md:px-10 pt-20 pb-8">
          <div className="flex gap-8 pt-6">
            {/* Sidebar - Desktop only */}
            <Sidebar selectedTag={selectedTag} onTagSelect={onTagSelect} />

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}
