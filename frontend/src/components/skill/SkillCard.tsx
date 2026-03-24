import { useState } from 'react'
import { Download, Heart, Star } from 'lucide-react'
import type { Skill } from '@/types/skill'

export interface SkillCardProps {
  skill: Skill
  onClick?: (skill: Skill) => void
}

// Emoji icons pool for skill cards
const SKILL_ICONS = ['🤖', '📊', '📝', '🔍', '⚡', '🎯', '🛠️', '📈', '🔮', '💡', '🧠', '🚀']

const getSkillIcon = (id: string): string => {
  const index = id.charCodeAt(0) % SKILL_ICONS.length
  return SKILL_ICONS[index]
}

export function SkillCard({ skill, onClick }: SkillCardProps): JSX.Element {
  const [imageError, setImageError] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick(skill)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left rounded-xl overflow-hidden border border-[var(--border-default)] bg-[var(--card-bg)] shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1"
    >
      {/* Cover Image - Better aspect ratio for visual appeal */}
      <div className="aspect-[16/10] bg-[var(--bg-subtle)] flex items-center justify-center overflow-hidden text-5xl">
        {skill.cover_url && !imageError ? (
          <img
            src={skill.cover_url}
            alt={skill.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="opacity-60">{getSkillIcon(skill.id)}</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-[var(--text-primary)] truncate">{skill.name}</h3>

        {/* Description */}
        <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
          {skill.description}
        </p>

        {/* Author */}
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
          by {skill.author_username || 'Unknown'}
        </p>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>{skill.rating_avg.toFixed(1)}</span>
            <span className="text-[var(--text-tertiary)]">({skill.rating_count})</span>
          </div>

          {/* Downloads */}
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{skill.download_count}</span>
          </div>

          {/* Favorites */}
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{skill.favorite_count}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
