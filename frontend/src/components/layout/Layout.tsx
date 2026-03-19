import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  unreadCount?: number
}

export const Layout = ({ unreadCount = 0 }: LayoutProps): JSX.Element => {
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
        <Header unreadCount={unreadCount} />

        <main className="flex-1 container mx-auto px-4 md:px-10 pt-24 pb-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}
