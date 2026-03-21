import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkillCard } from '../SkillCard'
import type { Skill } from '@/types/skill'

describe('SkillCard', () => {
  const mockSkill: Skill = {
    id: '1',
    name: 'PDF Processor',
    description: 'A powerful tool for processing PDF files',
    usage_scenario: 'Process PDFs in batch',
    usage_method: 'Upload PDFs and run',
    author_id: 'user-1',
    author_username: 'Alice',
    file_path: '/uploads/test.zip',
    file_size: 1024,
    tags: ['pdf', 'automation'],
    is_deleted: false,
    is_pinned: false,
    download_count: 100,
    view_count: 500,
    favorite_count: 50,
    rating_avg: 4.5,
    rating_count: 20,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  it('renders skill name and description', () => {
    render(<SkillCard skill={mockSkill} />)

    expect(screen.getByText('PDF Processor')).toBeInTheDocument()
    expect(screen.getByText('A powerful tool for processing PDF files')).toBeInTheDocument()
  })

  it('displays rating stars correctly', () => {
    render(<SkillCard skill={mockSkill} />)

    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(20)')).toBeInTheDocument()
  })

  it('shows download and favorite counts', () => {
    render(<SkillCard skill={mockSkill} />)

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('displays author username', () => {
    render(<SkillCard skill={mockSkill} />)

    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })

  it('shows placeholder image when no cover', () => {
    render(<SkillCard skill={mockSkill} />)

    expect(screen.getByTestId('skill-placeholder')).toBeInTheDocument()
  })

  it('calls onClick when clicking card', () => {
    const handleClick = vi.fn()
    render(<SkillCard skill={mockSkill} onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledWith(mockSkill)
  })

  it('shows hover effect on mouse enter', () => {
    render(<SkillCard skill={mockSkill} />)

    const card = screen.getByRole('button')
    fireEvent.mouseEnter(card)

    expect(card).toHaveClass('hover:shadow-lg')
  })
})
