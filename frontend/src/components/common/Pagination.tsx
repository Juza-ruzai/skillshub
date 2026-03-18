import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps): JSX.Element {
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | string)[] = []

    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      )
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }

    return pages
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const pages = getPageNumbers()

  const getButtonClasses = (isActive: boolean, isDisabled: boolean): string => {
    const baseClasses =
      'inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
    if (isDisabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400`
    }
    if (isActive) {
      return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`
    }
    return `${baseClasses} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`
  }

  return (
    <nav aria-label="Pagination" className="flex items-center gap-2">
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={getButtonClasses(false, currentPage === 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          typeof page === 'string' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
              className={getButtonClasses(currentPage === page, false)}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={getButtonClasses(false, currentPage === totalPages)}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next</span>
      </button>
    </nav>
  )
}
