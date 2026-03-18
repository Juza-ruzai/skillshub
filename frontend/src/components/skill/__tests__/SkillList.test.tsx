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
})
