import type { Skill } from '@/types/skill'
import type { ReactNode } from 'react'
import { SkillCard } from './SkillCard'
import { Loader2 } from 'lucide-react'

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
  emptyText = 'No skills found',
  onSkillClick,
  renderSkillCard,
}: SkillListProps): JSX.Element {
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
