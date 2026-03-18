import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface Tag {
  id: string
  name: string
  usageCount: number
}

interface TagListResponse {
  items: Tag[]
}

interface SidebarProps {
  selectedTag?: string
  onTagSelect?: (tag: string) => void
  onTagClick?: (tag: string) => void
}

export const Sidebar = ({ selectedTag, onTagSelect, onTagClick }: SidebarProps): JSX.Element => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await apiClient.get<TagListResponse>('/tags')
        setTags(response.data.items || [])
      } catch {
        setTags([])
      } finally {
        setLoading(false)
      }
    }
    fetchTags()
  }, [])

  // Calculate font size based on count (min 0.875rem, max 1.5rem)
  const getTagSize = (count: number) => {
    if (tags.length === 0) return '0.875rem'
    const maxCount = Math.max(...tags.map((t) => t.usageCount), 1)
    const minSize = 0.875
    const maxSize = 1.5
    const size = minSize + (count / maxCount) * (maxSize - minSize)
    return `${size}rem`
  }

  const handleTagClick = (tagName: string) => {
    if (onTagSelect) {
      onTagSelect(tagName)
    }
    if (onTagClick) {
      onTagClick(tagName)
    }
  }

  const TagList = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-wrap gap-2 ${isMobile ? '' : 'content-start'}`}>
      {loading ? (
        <div className="text-sm text-gray-500">加载中...</div>
      ) : tags.length === 0 ? (
        <div className="text-sm text-gray-500">暂无标签</div>
      ) : (
        tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => {
              handleTagClick(tag.name)
              if (isMobile) {
                setMobileDrawerOpen(false)
              }
            }}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              selectedTag === tag.name
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            style={{ fontSize: isMobile ? undefined : getTagSize(tag.usageCount) }}
          >
            {tag.name}
            <span className="ml-1.5 text-xs opacity-70">({tag.usageCount})</span>
          </button>
        ))
      )}
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
