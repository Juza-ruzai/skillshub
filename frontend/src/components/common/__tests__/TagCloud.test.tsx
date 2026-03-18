import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TagCloud } from '../TagCloud'

describe('TagCloud', () => {
  const mockTags = [
    { name: 'react', count: 100 },
    { name: 'typescript', count: 80 },
    { name: 'javascript', count: 60 },
    { name: 'nodejs', count: 40 },
    { name: 'python', count: 20 },
  ]

  it('renders tags with different sizes based on count', () => {
    render(<TagCloud tags={mockTags} onTagSelect={vi.fn()} />)

    mockTags.forEach((tag) => {
      expect(screen.getByText(tag.name)).toBeInTheDocument()
    })
  })

  it('highlights selected tags', () => {
    render(
      <TagCloud tags={mockTags} selectedTags={['react', 'typescript']} onTagSelect={vi.fn()} />
    )

    const reactTag = screen.getByRole('button', { name: /react/i })
    expect(reactTag).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onTagSelect when clicking tag', () => {
    const handleSelect = vi.fn()
    render(<TagCloud tags={mockTags} onTagSelect={handleSelect} />)

    fireEvent.click(screen.getByRole('button', { name: /react/i }))

    expect(handleSelect).toHaveBeenCalledWith('react')
  })

  it('shows clear button when tags are selected', () => {
    render(
      <TagCloud tags={mockTags} selectedTags={['react']} onTagSelect={vi.fn()} onClear={vi.fn()} />
    )

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('calls onClear when clicking clear button', () => {
    const handleClear = vi.fn()
    render(
      <TagCloud
        tags={mockTags}
        selectedTags={['react']}
        onTagSelect={vi.fn()}
        onClear={handleClear}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /clear/i }))

    expect(handleClear).toHaveBeenCalled()
  })
})
