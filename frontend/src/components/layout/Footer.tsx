import { Link } from 'react-router-dom'

export const Footer = (): JSX.Element => {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">© 2024 OpenClaw. All rights reserved.</p>

          {/* Quick Links */}
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              首页
            </Link>
            <Link
              to="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              关于
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
