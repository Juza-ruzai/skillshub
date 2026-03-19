import type { Skill } from '@/types/skill'
import type { ReactNode } from 'react'
import { useState, useCallback } from 'react'
import { SkillCard } from './SkillCard'
import { Loader2, LayoutGrid, List } from 'lucide-react'

export interface SkillListProps {
  skills: Skill[]
  loading?: boolean
  error?: string | null
  emptyText?: string
  onSkillClick?: (skill: Skill) => void
  renderSkillCard?: (skill: Skill) => ReactNode
}

type ViewMode = 'grid' | 'list'

export function SkillList({
  skills,
  loading,
  error,
  emptyText = 'No skills found',
  onSkillClick,
  renderSkillCard,
}: SkillListProps): JSX.Element {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const handleGridClick = useCallback(() => setViewMode('grid'), [])
  const handleListClick = useCallback(() => setViewMode('list'), [])

  if (loading) {
    return (
      <div data-testid="skill-skeleton" className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyText}</p>
      </div>
    )
  }

  const containerClasses =
    viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      : 'flex flex-col gap-4'

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleGridClick}
          aria-label="Grid view"
          data-active={viewMode === 'grid'}
          className="p-2 rounded-lg transition-all duration-200"
          style={{
            background: viewMode === 'grid' ? 'rgba(59,130,246,0.12)' : 'var(--card-bg)',
            color: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: '1px solid var(--card-border)',
          }}
        >
          <LayoutGrid size={18} />
        </button>
        <button
          type="button"
          onClick={handleListClick}
          aria-label="List view"
          data-active={viewMode === 'list'}
          className="p-2 rounded-lg transition-all duration-200"
          style={{
            background: viewMode === 'list' ? 'rgba(59,130,246,0.12)' : 'var(--card-bg)',
            color: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            border: '1px solid var(--card-border)',
          }}
        >
          <List size={18} />
        </button>
      </div>

      {/* Skills Container */}
      <div className={containerClasses}>
        {skills.map((skill) =>
          renderSkillCard ? (
            renderSkillCard(skill)
          ) : (
            <SkillCard key={skill.id} skill={skill} onClick={onSkillClick} />
          )
        )}
      </div>
    </div>
  )
}
