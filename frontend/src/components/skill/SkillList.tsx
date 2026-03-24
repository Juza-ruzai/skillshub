import type { Skill } from '@/types/skill'
import type { ReactNode } from 'react'
import { SkillCard } from './SkillCard'
import { LoadingState, EmptyState, ErrorState } from '@/components/common/UIState'

export interface SkillListProps {
  skills: Skill[]
  loading?: boolean
  error?: string | null
  emptyText?: string
  onSkillClick?: (skill: Skill) => void
  renderSkillCard?: (skill: Skill) => ReactNode
}

export function SkillList({
  skills,
  loading,
  error,
  emptyText = '暂无 Skill',
  onSkillClick,
  renderSkillCard,
}: SkillListProps): JSX.Element {
  if (loading) {
    return <LoadingState data-testid="skill-skeleton" />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (skills.length === 0) {
    return <EmptyState message={emptyText} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skills.map((skill) =>
        renderSkillCard ? (
          renderSkillCard(skill)
        ) : (
          <SkillCard key={skill.id} skill={skill} onClick={onSkillClick} />
        )
      )}
    </div>
  )
}
