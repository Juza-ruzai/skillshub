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
    <div className="min-h-screen flex flex-col bg-background">
      <Header onSearch={onSearch} unreadCount={unreadCount} />

      <div className="flex-1 container mx-auto px-4 pt-20 pb-8">
        <div className="flex gap-8">
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
  )
}
