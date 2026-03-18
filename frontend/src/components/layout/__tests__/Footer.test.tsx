import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Footer } from '../Footer'

describe('Footer', () => {
  it('应该显示版权信息', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )

    expect(screen.getByText(/© 2024 OpenClaw/i)).toBeInTheDocument()
  })

  it('应该显示快速链接', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )

    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('关于')).toBeInTheDocument()
  })

  it('应该固定在页面底部', () => {
    const { container } = render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )

    const footer = container.querySelector('footer')
    expect(footer).toHaveClass('mt-auto')
  })

  it('链接应该可以导航到对应页面', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )

    const homeLink = screen.getByText('首页').closest('a')
    expect(homeLink).toHaveAttribute('href', '/')

    const aboutLink = screen.getByText('关于').closest('a')
    expect(aboutLink).toHaveAttribute('href', '/about')
  })
})
