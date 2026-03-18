import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkillList } from '../SkillList'
import type { Skill } from '@/types/skill'

describe('SkillList', () => {
  const mockSkills: Skill[] = [
    {
      id: '1',
      name: 'PDF Processor',
      description: 'Process PDFs',
      usageScenario: 'Batch processing',
      usageMethod: 'Upload and run',
      authorId: 'user-1',
      authorUsername: 'Alice',
      filePath: '/uploads/1.zip',
      fileSize: 1024,
      tags: ['pdf'],
      isDeleted: false,
      isPinned: false,
      downloadCount: 100,
      viewCount: 500,
      favoriteCount: 50,
      ratingAvg: 4.5,
      ratingCount: 20,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Image Converter',
      description: 'Convert images',
      usageScenario: 'Format conversion',
      usageMethod: 'Drag and drop',
      authorId: 'user-2',
      authorUsername: 'Bob',
      filePath: '/uploads/2.zip',
      fileSize: 2048,
      tags: ['image'],
      isDeleted: false,
      isPinned: false,
      downloadCount: 200,
      viewCount: 800,
      favoriteCount: 80,
      ratingAvg: 4.0,
      ratingCount: 15,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ]

  it('renders skills in grid layout', () => {
    render(<SkillList skills={mockSkills} />)

    expect(screen.getByText('PDF Processor')).toBeInTheDocument()
    expect(screen.getByText('Image Converter')).toBeInTheDocument()
  })

  it('shows skeleton when loading', () => {
    render(<SkillList skills={[]} loading />)

    expect(screen.getByTestId('skill-skeleton')).toBeInTheDocument()
  })

  it('displays empty state when no skills', () => {
    render(<SkillList skills={[]} emptyText="No skills found" />)

    expect(screen.getByText('No skills found')).toBeInTheDocument()
  })

  it('shows error message on error', () => {
    render(<SkillList skills={[]} error="Failed to load" />)

    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })

  it('calls onSkillClick when clicking skill', () => {
    const handleClick = vi.fn()
    render(<SkillList skills={mockSkills} onSkillClick={handleClick} />)

    fireEvent.click(screen.getByText('PDF Processor'))

    expect(handleClick).toHaveBeenCalledWith(mockSkills[0])
  })

  it('uses custom renderSkillCard when provided', () => {
    const customRender = vi.fn((skill: Skill) => (
      <div key={skill.id} data-testid="custom-card">
        {skill.name}
      </div>
    ))
    render(<SkillList skills={mockSkills} renderSkillCard={customRender} />)

    expect(screen.getAllByTestId('custom-card')).toHaveLength(2)
  })

  describe('View Mode Toggle', () => {
    it('displays view mode toggle buttons', () => {
      render(<SkillList skills={mockSkills} />)

      expect(screen.getByRole('button', { name: /grid view/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /list view/i })).toBeInTheDocument()
    })

    it('defaults to grid view', () => {
      const { container } = render(<SkillList skills={mockSkills} />)

      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toBeInTheDocument()
    })

    it('switches to list view when clicking list button', () => {
      const { container } = render(<SkillList skills={mockSkills} />)

      const listButton = screen.getByRole('button', { name: /list view/i })
      fireEvent.click(listButton)

      const listContainer = container.querySelector('.flex-col')
      expect(listContainer).toBeInTheDocument()
    })

    it('switches back to grid view when clicking grid button', () => {
      const { container } = render(<SkillList skills={mockSkills} />)

      // First switch to list view
      fireEvent.click(screen.getByRole('button', { name: /list view/i }))
      expect(container.querySelector('.flex-col')).toBeInTheDocument()

      // Then switch back to grid view
      fireEvent.click(screen.getByRole('button', { name: /grid view/i }))
      expect(container.querySelector('.grid')).toBeInTheDocument()
    })

    it('shows grid button as active in grid mode', () => {
      render(<SkillList skills={mockSkills} />)

      const gridButton = screen.getByRole('button', { name: /grid view/i })
      const listButton = screen.getByRole('button', { name: /list view/i })

      expect(gridButton).toHaveAttribute('data-active', 'true')
      expect(listButton).toHaveAttribute('data-active', 'false')
    })

    it('shows list button as active in list mode', () => {
      render(<SkillList skills={mockSkills} />)

      fireEvent.click(screen.getByRole('button', { name: /list view/i }))

      const gridButton = screen.getByRole('button', { name: /grid view/i })
      const listButton = screen.getByRole('button', { name: /list view/i })

      expect(gridButton).toHaveAttribute('data-active', 'false')
      expect(listButton).toHaveAttribute('data-active', 'true')
    })

    it('calls onSkillClick in list view', () => {
      const handleClick = vi.fn()
      render(<SkillList skills={mockSkills} onSkillClick={handleClick} />)

      fireEvent.click(screen.getByRole('button', { name: /list view/i }))
      fireEvent.click(screen.getByText('PDF Processor'))

      expect(handleClick).toHaveBeenCalledWith(mockSkills[0])
    })

    it('preserves view mode when skills update', () => {
      const { rerender } = render(<SkillList skills={mockSkills} />)

      // Switch to list view
      fireEvent.click(screen.getByRole('button', { name: /list view/i }))

      // Update skills
      const updatedSkills = [...mockSkills, { ...mockSkills[0], id: '3', name: 'New Skill' }]
      rerender(<SkillList skills={updatedSkills} />)

      // Should still be in list view
      const listButton = screen.getByRole('button', { name: /list view/i })
      expect(listButton).toHaveAttribute('data-active', 'true')
    })
  })
})
