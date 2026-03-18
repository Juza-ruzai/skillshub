import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SkillForm } from '../SkillForm'

describe('SkillForm', () => {
  it('renders all form fields', () => {
    render(<SkillForm mode="create" onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/usage scenario/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/usage method/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
  })

  it('validates required fields on submit', async () => {
    render(<SkillForm mode="create" onSubmit={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /create skill/i }))

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/description is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation errors for invalid input', async () => {
    render(<SkillForm mode="create" onSubmit={vi.fn()} />)

    const nameInput = screen.getByLabelText(/name/i)
    fireEvent.change(nameInput, { target: { value: 'ab' } })

    fireEvent.click(screen.getByRole('button', { name: /create skill/i }))

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  it('calls onSubmit with form data', async () => {
    const handleSubmit = vi.fn()
    render(<SkillForm mode="create" onSubmit={handleSubmit} />)

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Skill' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'A test skill' } })
    fireEvent.change(screen.getByLabelText(/usage scenario/i), { target: { value: 'Testing' } })
    fireEvent.change(screen.getByLabelText(/usage method/i), { target: { value: 'Run the test' } })

    fireEvent.click(screen.getByRole('button', { name: /create skill/i }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'Test Skill',
        description: 'A test skill',
        usageScenario: 'Testing',
        usageMethod: 'Run the test',
        tags: [],
      })
    })
  })

  it('resets form after successful submit', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    render(<SkillForm mode="create" onSubmit={handleSubmit} />)

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Skill' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'A test skill' } })
    fireEvent.change(screen.getByLabelText(/usage scenario/i), { target: { value: 'Testing' } })
    fireEvent.change(screen.getByLabelText(/usage method/i), { target: { value: 'Run the test' } })
    fireEvent.click(screen.getByRole('button', { name: /create skill/i }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled()
    })

    // Form should be reset after successful submit
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
      expect(nameInput.value).toBe('')
    })
  })

  it('handles tag input correctly', () => {
    render(<SkillForm mode="create" onSubmit={vi.fn()} />)

    const tagInput = screen.getByPlaceholderText(/add a tag/i)
    fireEvent.change(tagInput, { target: { value: 'react' } })
    fireEvent.keyDown(tagInput, { key: 'Enter' })

    expect(screen.getByText('react')).toBeInTheDocument()
  })

  it('removes tags when clicking remove button', () => {
    render(<SkillForm mode="create" onSubmit={vi.fn()} />)

    const tagInput = screen.getByPlaceholderText(/add a tag/i)
    fireEvent.change(tagInput, { target: { value: 'react' } })
    fireEvent.keyDown(tagInput, { key: 'Enter' })

    expect(screen.getByText('react')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /remove tag/i }))

    expect(screen.queryByText('react')).not.toBeInTheDocument()
  })

  it('fills initial data in edit mode', () => {
    const initialData = {
      name: 'Existing Skill',
      description: 'Existing description',
      usageScenario: 'Existing scenario',
      usageMethod: 'Existing method',
      tags: ['existing', 'tag'],
    }

    render(<SkillForm mode="edit" initialData={initialData} onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/name/i)).toHaveValue('Existing Skill')
    expect(screen.getByLabelText(/description/i)).toHaveValue('Existing description')
    expect(screen.getByText('existing')).toBeInTheDocument()
  })

  it('disables submit button when submitting', () => {
    render(<SkillForm mode="create" onSubmit={vi.fn()} loading />)

    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })
})
