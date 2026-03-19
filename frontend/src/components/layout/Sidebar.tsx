import { useState, useEffect } from 'react'
import { Filter, X, Tag as TagIcon } from 'lucide-react'
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

  const getTagSize = (count: number) => {
    if (tags.length === 0) return '0.8rem'
    const maxCount = Math.max(...tags.map((t) => t.usageCount), 1)
    const minSize = 0.75
    const maxSize = 1.1
    const size = minSize + (count / maxCount) * (maxSize - minSize)
    return `${size}rem`
  }

  const handleTagClick = (tagName: string) => {
    if (onTagSelect) onTagSelect(tagName)
    if (onTagClick) onTagClick(tagName)
  }

  const TagList = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-wrap gap-2 ${isMobile ? '' : 'content-start'}`}>
      {loading ? (
        <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          加载中...
        </div>
      ) : tags.length === 0 ? (
        <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          暂无标签
        </div>
      ) : (
        tags.map((tag) => {
          const isSelected = selectedTag === tag.name
          return (
            <button
              key={tag.id}
              onClick={() => {
                handleTagClick(tag.name)
                if (isMobile) setMobileDrawerOpen(false)
              }}
              className="px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                fontSize: isMobile ? '0.875rem' : getTagSize(tag.usageCount),
                background: isSelected ? 'var(--btn-gradient)' : 'var(--card-bg)',
                color: isSelected ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${isSelected ? 'transparent' : 'var(--card-border)'}`,
                boxShadow: isSelected ? '0 4px 12px rgba(59,130,246,0.25)' : 'none',
                backdropFilter: 'blur(10px)',
              }}
            >
              {tag.name}
              <span className="ml-1.5 text-xs" style={{ opacity: isSelected ? 0.85 : 0.6 }}>
                {tag.usageCount}
              </span>
            </button>
          )
        })
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div
          className="sticky top-20 p-5 rounded-2xl"
          style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <h3
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <Filter className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            标签筛选
          </h3>
          <TagList />
        </div>
      </aside>

      {/* Mobile Drawer Button */}
      <button
        aria-label="打开筛选"
        onClick={() => setMobileDrawerOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 p-3 rounded-full z-40 transition-all duration-200 hover:scale-110"
        style={{
          background: 'var(--btn-gradient)',
          boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
          color: 'white',
        }}
      >
        <TagIcon className="w-5 h-5" />
      </button>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div
            data-testid="mobile-drawer"
            className="lg:hidden fixed inset-y-0 right-0 w-80 z-50 p-6"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderLeft: '1px solid var(--card-border)',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-base font-semibold flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Filter className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                标签筛选
              </h3>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
              >
                <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            <TagList isMobile />
          </div>
        </>
      )}
    </>
  )
}
