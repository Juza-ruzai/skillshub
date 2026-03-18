import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from '../Pagination'

describe('Pagination', () => {
  it('renders page numbers correctly', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={10} onPageChange={vi.fn()} />)

    const prevButton = screen.getByRole('button', { name: /previous/i })
    expect(prevButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination currentPage={10} totalPages={10} onPageChange={vi.fn()} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()
  })

  it('calls onPageChange when clicking page number', () => {
    const handleChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={10} onPageChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Go to page 5' }))

    expect(handleChange).toHaveBeenCalledWith(5)
  })

  it('calls onPageChange when clicking previous/next', () => {
    const handleChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={10} onPageChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: /previous/i }))
    expect(handleChange).toHaveBeenCalledWith(2)

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(handleChange).toHaveBeenCalledWith(4)
  })

  it('shows ellipsis for many pages', () => {
    render(<Pagination currentPage={5} totalPages={20} onPageChange={vi.fn()} />)

    const ellipses = screen.getAllByText('...')
    expect(ellipses.length).toBeGreaterThanOrEqual(1)
  })

  it('handles edge case of single page', () => {
    render(<Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
  })
})
