import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StarRating } from '../StarRating'

describe('StarRating', () => {
  it('renders correct number of stars', () => {
    render(<StarRating value={3} />)
    const stars = screen.getAllByRole('button')
    expect(stars).toHaveLength(5)
  })

  it('displays filled stars for whole number rating', () => {
    render(<StarRating value={3} />)
    const filledStars = screen.getAllByLabelText(/filled star/i)
    expect(filledStars).toHaveLength(3)
  })

  it('displays half star for decimal rating (3.5)', () => {
    render(<StarRating value={3.5} />)
    const halfStar = screen.getByLabelText(/half star/i)
    expect(halfStar).toBeInTheDocument()
  })

  it('calls onChange when clicking star in interactive mode', () => {
    const handleChange = vi.fn()
    render(<StarRating value={0} onChange={handleChange} />)

    const stars = screen.getAllByRole('button')
    fireEvent.click(stars[2])

    expect(handleChange).toHaveBeenCalledWith(3)
  })

  it('does not call onChange in readonly mode', () => {
    const handleChange = vi.fn()
    render(<StarRating value={3} readonly onChange={handleChange} />)

    const stars = screen.getAllByRole('img')
    fireEvent.click(stars[0])

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('shows hover effect on mouse enter in interactive mode', () => {
    render(<StarRating value={0} />)

    const stars = screen.getAllByRole('button')
    fireEvent.mouseEnter(stars[2])

    // Check that stars before and including the hovered one are highlighted
    expect(stars[2]).toHaveAttribute('data-hover', 'true')
  })

  it('different sizes render correctly', () => {
    const { rerender } = render(<StarRating value={3} size="sm" />)
    expect(screen.getByTestId('star-rating')).toHaveClass('text-sm')

    rerender(<StarRating value={3} size="md" />)
    expect(screen.getByTestId('star-rating')).toHaveClass('text-base')

    rerender(<StarRating value={3} size="lg" />)
    expect(screen.getByTestId('star-rating')).toHaveClass('text-lg')
  })

  it('displays correct aria labels for accessibility', () => {
    render(<StarRating value={3} />)
    expect(screen.getByLabelText('Rating: 3 out of 5')).toBeInTheDocument()
  })
})
