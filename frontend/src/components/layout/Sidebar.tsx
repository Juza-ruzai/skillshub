import { useState } from 'react'
import { Filter, X } from 'lucide-react'

interface Tag {
  name: string
  count: number
}

interface SidebarProps {
  tags: Tag[]
  selectedTag?: string
  onTagSelect: (tag: string) => void
}

export const Sidebar = ({ tags, selectedTag, onTagSelect }: SidebarProps): JSX.Element => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Calculate font size based on count (min 0.875rem, max 1.5rem)
  const getTagSize = (count: number) => {
    const maxCount = Math.max(...tags.map((t) => t.count), 1)
    const minSize = 0.875
    const maxSize = 1.5
    const size = minSize + (count / maxCount) * (maxSize - minSize)
    return `${size}rem`
  }

  const TagList = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-wrap gap-2 ${isMobile ? '' : 'content-start'}`}>
      {tags.map((tag) => (
        <button
          key={tag.name}
          onClick={() => {
            onTagSelect(tag.name)
            if (isMobile) {
              setMobileDrawerOpen(false)
            }
          }}
          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
            selectedTag === tag.name
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
          style={{ fontSize: isMobile ? undefined : getTagSize(tag.count) }}
        >
          {tag.name}
          <span className="ml-1.5 text-xs opacity-70">({tag.count})</span>
        </button>
      ))}
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-20 p-4 rounded-lg border bg-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            标签筛选
          </h3>
          <TagList />
        </div>
      </aside>

      {/* Mobile Drawer Button */}
      <button
        aria-label="打开筛选"
        onClick={() => setMobileDrawerOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 p-3 bg-primary text-primary-foreground rounded-full shadow-lg z-40"
      >
        <Filter className="w-5 h-5" />
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div
            data-testid="mobile-drawer"
            className="lg:hidden fixed inset-y-0 right-0 w-80 bg-background border-l z-50 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                标签筛选
              </h3>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 hover:bg-accent rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <TagList isMobile />
          </div>
        </>
      )}
    </>
  )
}
