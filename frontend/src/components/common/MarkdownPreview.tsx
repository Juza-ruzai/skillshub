import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

export interface MarkdownPreviewProps {
  content: string
  className?: string
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps): JSX.Element {
  const sanitizedHtml = useMemo(() => {
    // Pre-process: normalize line endings
    const normalizedContent = content.replace(/\r\n/g, '\n')

    // Parse markdown
    const html = marked.parse(normalizedContent, {
      async: false,
      gfm: true,
      breaks: false, // Use standard markdown line break behavior
    }) as string

    // Sanitize HTML
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'code',
        'pre',
        'blockquote',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'a',
        'img',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'hr',
      ],
      ALLOWED_ATTR: ['href', 'title', 'src', 'alt', 'target', 'rel'],
    })

    // Add target and rel to links
    return clean.replace(
      /<a\s+href="([^"]+)"([^>]*)>/gi,
      '<a href="$1"$2 target="_blank" rel="noopener noreferrer">'
    )
  }, [content])

  return (
    <div
      data-testid="markdown-preview"
      className={`prose prose-slate max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}
