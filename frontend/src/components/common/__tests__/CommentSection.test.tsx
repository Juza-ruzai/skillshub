import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CommentSection } from '../CommentSection'
import type { CommentWithReplies } from '@/types/comment'

describe('CommentSection', () => {
  const mockComments: CommentWithReplies[] = [
    {
      id: '1',
      skillId: 'skill-1',
      userId: 'user-1',
      username: 'Alice',
      content: 'Great skill!',
      parentId: undefined,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      replies: [
        {
          id: '2',
          skillId: 'skill-1',
          userId: 'user-2',
          username: 'Bob',
          content: 'Thanks!',
          parentId: '1',
          createdAt: '2024-01-01T01:00:00Z',
          updatedAt: '2024-01-01T01:00:00Z',
          replies: [],
        },
      ],
    },
  ]

  it('renders comment list with nested replies', () => {
    render(<CommentSection comments={mockComments} onSubmitComment={vi.fn()} />)

    expect(screen.getByText('Great skill!')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Thanks!')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows comment form when currentUserId is provided', () => {
    render(<CommentSection comments={[]} currentUserId="user-1" onSubmitComment={vi.fn()} />)

    expect(screen.getByPlaceholderText(/write a comment/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /post comment/i })).toBeInTheDocument()
  })

  it('hides comment form when currentUserId is not provided', () => {
    render(<CommentSection comments={[]} onSubmitComment={vi.fn()} />)

    expect(screen.queryByPlaceholderText(/write a comment/i)).not.toBeInTheDocument()
  })

  it('calls onSubmitComment when submitting comment', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    render(<CommentSection comments={[]} currentUserId="user-1" onSubmitComment={handleSubmit} />)

    const textarea = screen.getByPlaceholderText(/write a comment/i)
    fireEvent.change(textarea, { target: { value: 'New comment' } })

    fireEvent.click(screen.getByRole('button', { name: /post comment/i }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ content: 'New comment' })
    })
  })

  it('shows reply form when clicking reply', () => {
    render(
      <CommentSection comments={mockComments} currentUserId="user-1" onSubmitComment={vi.fn()} />
    )

    // Click the first Reply button (Alice's comment)
    const replyButtons = screen.getAllByText('Reply')
    fireEvent.click(replyButtons[0])

    expect(screen.getByPlaceholderText(/write a reply/i)).toBeInTheDocument()
  })

  it('shows delete button for own comments', () => {
    render(
      <CommentSection
        comments={mockComments}
        currentUserId="user-1"
        onSubmitComment={vi.fn()}
        onDeleteComment={vi.fn()}
      />
    )

    // Alice's comment (user-1) should have delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    expect(deleteButtons.length).toBeGreaterThan(0)
  })

  it('displays loading state', () => {
    render(<CommentSection comments={[]} isLoading={true} onSubmitComment={vi.fn()} />)

    expect(screen.getByText(/loading comments/i)).toBeInTheDocument()
  })
})
