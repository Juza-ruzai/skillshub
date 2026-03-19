import { useState } from 'react'
import { Star } from 'lucide-react'

export interface StarRatingProps {
  value: number
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  onChange?: (value: number) => void
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const starSizes = {
  sm: 14,
  md: 18,
  lg: 24,
}

export function StarRating({
  value,
  readonly = false,
  size = 'md',
  onChange,
}: StarRatingProps): JSX.Element {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayValue = hoverValue ?? value
  const fullStars = Math.floor(displayValue)
  const hasHalfStar = displayValue % 1 >= 0.5

  const handleClick = (starIndex: number) => {
    if (readonly || !onChange) return
    onChange(starIndex)
  }

  const handleMouseEnter = (starIndex: number) => {
    if (readonly) return
    setHoverValue(starIndex)
  }

  const handleMouseLeave = () => {
    setHoverValue(null)
  }

  return (
    <div
      data-testid="star-rating"
      className={`flex items-center gap-0.5 ${sizeClasses[size]}`}
      role="img"
      aria-label={`Rating: ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= fullStars
        const isHalf = !isFilled && starIndex === fullStars + 1 && hasHalfStar

        return (
          <span
            key={starIndex}
            role={readonly ? 'img' : 'button'}
            tabIndex={readonly ? -1 : 0}
            aria-label={isFilled ? 'Filled star' : isHalf ? 'Half star' : 'Empty star'}
            data-hover={hoverValue !== null && starIndex <= hoverValue}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClick(starIndex)
              }
            }}
            className={`
              relative cursor-${readonly ? 'default' : 'pointer'}
              transition-all duration-200 hover:scale-110
            `}
            style={{
              color: isFilled ? '#fbbf24' : isHalf ? '#fbbf24' : 'var(--text-tertiary)',
              opacity: hoverValue !== null && starIndex <= hoverValue ? 1 : 0.8,
            }}
          >
            {isHalf ? (
              <span className="relative inline-block">
                <Star
                  size={starSizes[size]}
                  style={{ color: 'var(--text-tertiary)' }}
                  fill="none"
                />
                <span className="absolute inset-0 overflow-hidden w-1/2">
                  <Star size={starSizes[size]} fill="currentColor" />
                </span>
              </span>
            ) : (
              <Star size={starSizes[size]} fill={isFilled ? 'currentColor' : 'none'} />
            )}
          </span>
        )
      })}
    </div>
  )
}
