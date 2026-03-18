import { X } from 'lucide-react'

export interface TagCloudProps {
  tags: { name: string; count: number }[]
  selectedTags?: string[]
  onTagSelect: (tag: string) => void
  onClear?: () => void
}

export function TagCloud({
  tags,
  selectedTags = [],
  onTagSelect,
  onClear,
}: TagCloudProps): JSX.Element {
  if (tags.length === 0) {
    return <div className="text-gray-500 text-sm">No tags available</div>
  }

  const maxCount = Math.max(...tags.map((t) => t.count))
  const minCount = Math.min(...tags.map((t) => t.count))

  const getSizeClass = (count: number): string => {
    if (maxCount === minCount) return 'text-base'

    const ratio = (count - minCount) / (maxCount - minCount)

    if (ratio >= 0.8) return 'text-xl font-bold'
    if (ratio >= 0.6) return 'text-lg font-semibold'
    if (ratio >= 0.4) return 'text-base font-medium'
    if (ratio >= 0.2) return 'text-sm'
    return 'text-xs'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name)

          return (
            <button
              key={tag.name}
              type="button"
              onClick={() => onTagSelect(tag.name)}
              aria-pressed={isSelected}
              aria-label={`${tag.name} (${tag.count})`}
              className={`
                ${getSizeClass(tag.count)}
                px-3 py-1.5 rounded-full transition-all duration-200
                ${
                  isSelected
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {tag.name}
              <span className={`ml-1.5 text-xs ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                ({tag.count})
              </span>
            </button>
          )
        })}
      </div>

      {selectedTags.length > 0 && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Clear filters"
        >
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  )
}
