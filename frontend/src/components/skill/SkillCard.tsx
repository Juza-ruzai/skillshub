import { useState } from 'react'
import { Download, Heart, Star, Package } from 'lucide-react'
import type { Skill } from '@/types/skill'

export interface SkillCardProps {
  skill: Skill
  onClick?: (skill: Skill) => void
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
      className="w-full text-left bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Cover Image */}
      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
        {skill.cover_url && !imageError ? (
          <img
            src={skill.cover_url}
            alt={skill.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Package data-testid="skill-placeholder" className="w-16 h-16 text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 truncate">{skill.name}</h3>

        {/* Description */}
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{skill.description}</p>

        {/* Author */}
        <p className="mt-2 text-xs text-gray-500">by {skill.author_username || 'Unknown'}</p>

        {/* Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{skill.rating_avg.toFixed(1)}</span>
            <span className="text-gray-400">({skill.rating_count})</span>
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
