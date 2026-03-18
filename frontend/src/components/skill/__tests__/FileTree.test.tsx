import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileTree, type FileTreeNode } from '../FileTree'

describe('FileTree', () => {
  const mockData: FileTreeNode[] = [
    {
      name: 'src',
      type: 'directory',
      children: [
        {
          name: 'components',
          type: 'directory',
          children: [
            { name: 'Button.tsx', type: 'file' },
            { name: 'Input.tsx', type: 'file' },
          ],
        },
        { name: 'App.tsx', type: 'file' },
      ],
    },
    { name: 'README.md', type: 'file' },
  ]

  it('renders directory structure', () => {
    render(<FileTree data={mockData} />)

    expect(screen.getByText('src')).toBeInTheDocument()
    expect(screen.getByText('README.md')).toBeInTheDocument()
  })

  it('toggles folder expand/collapse', () => {
    render(<FileTree data={mockData} />)

    const srcFolder = screen.getByRole('button', { name: /src/i })
    fireEvent.click(srcFolder)

    // After clicking, children should be visible
    expect(screen.getByText('components')).toBeInTheDocument()
    expect(screen.getByText('App.tsx')).toBeInTheDocument()
  })

  it('shows different icons for file and directory', () => {
    render(<FileTree data={mockData} />)

    const folderIcon = screen.getByTestId('folder-icon')
    expect(folderIcon).toBeInTheDocument()
  })

  it('calls onFileClick when clicking file', () => {
    const handleFileClick = vi.fn()
    render(<FileTree data={mockData} onFileClick={handleFileClick} />)

    const readmeFile = screen.getByRole('button', { name: /README\.md/i })
    fireEvent.click(readmeFile)

    expect(handleFileClick).toHaveBeenCalledWith('README.md')
  })

  it('does not call onFileClick when clicking directory', () => {
    const handleFileClick = vi.fn()
    render(<FileTree data={mockData} onFileClick={handleFileClick} />)

    const srcFolder = screen.getByRole('button', { name: /src/i })
    fireEvent.click(srcFolder)

    expect(handleFileClick).not.toHaveBeenCalled()
  })

  it('handles deeply nested structure', () => {
    render(<FileTree data={mockData} />)

    // Expand src
    fireEvent.click(screen.getByRole('button', { name: /src/i }))
    // Expand components
    fireEvent.click(screen.getByRole('button', { name: /components/i }))

    // Deeply nested files should be visible
    expect(screen.getByText('Button.tsx')).toBeInTheDocument()
    expect(screen.getByText('Input.tsx')).toBeInTheDocument()
  })
})
