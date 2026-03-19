import { Link } from 'react-router-dom'

export const Footer = (): JSX.Element => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Gradient divider */}
      <div
        style={{
          height: 1,
          background:
            'linear-gradient(90deg, transparent 0%, var(--accent-primary) 50%, transparent 100%)',
          opacity: 0.3,
        }}
      />
      <div className="container mx-auto px-4 md:px-10 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand + Copyright */}
          <div className="flex items-center gap-3">
            <span
              className="text-base font-bold font-heading"
              style={{
                background: 'var(--btn-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              OpenClaw
            </span>
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              © 2026 All rights reserved.
            </span>
          </div>

          {/* Quick Links */}
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm transition-colors duration-200"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              首页
            </Link>
            <Link
              to="/upload"
              className="text-sm transition-colors duration-200"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              上传 Skill
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
