export const Footer = (): JSX.Element => {
  return (
    <footer
      className="mt-auto"
      style={{
        borderTop: '1px solid var(--card-border)',
      }}
    >
      <div className="container mx-auto px-4 md:px-10 py-5">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
            © 2026 OpenClaw. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}
