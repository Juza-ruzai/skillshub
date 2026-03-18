import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MarkdownPreview } from '../MarkdownPreview'

describe('MarkdownPreview', () => {
  it('renders headings correctly', () => {
    const content = `# Heading 1
## Heading 2`
    const { container } = render(<MarkdownPreview content={content} />)

    const h1 = container.querySelector('h1')
    const h2 = container.querySelector('h2')

    expect(h1).toHaveTextContent('Heading 1')
    expect(h2).toHaveTextContent('Heading 2')
  })

  it('renders lists correctly', () => {
    const content = `- Item 1
- Item 2
- Item 3`
    const { container } = render(<MarkdownPreview content={content} />)

    const items = container.querySelectorAll('li')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Item 1')
    expect(items[1]).toHaveTextContent('Item 2')
    expect(items[2]).toHaveTextContent('Item 3')
  })

  it('renders code blocks', () => {
    const content = `\`\`\`
code block
\`\`\``
    const { container } = render(<MarkdownPreview content={content} />)

    const codeBlock = container.querySelector('code')
    expect(codeBlock).toBeInTheDocument()
    expect(codeBlock).toHaveTextContent(/code block/)
  })

  it('sanitizes HTML to prevent XSS', () => {
    const xssContent = '<script>alert("XSS")</script><p>Safe content</p>'
    const { container } = render(<MarkdownPreview content={xssContent} />)

    expect(container.querySelector('script')).not.toBeInTheDocument()
    expect(container.querySelector('p')).toHaveTextContent('Safe content')
  })

  it('renders links with proper attributes', () => {
    const { container } = render(<MarkdownPreview content="[Link](https://example.com)" />)

    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
