import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
  const mockTags = [
    { name: 'React', count: 10 },
    { name: 'Vue', count: 5 },
    { name: 'Angular', count: 3 },
  ]

  describe('标签云展示', () => {
    it('应该显示所有标签', () => {
      render(<Sidebar tags={mockTags} onTagSelect={vi.fn()} />)

      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Vue')).toBeInTheDocument()
      expect(screen.getByText('Angular')).toBeInTheDocument()
    })

    it('应该显示标签使用次数', () => {
      render(<Sidebar tags={mockTags} onTagSelect={vi.fn()} />)

      expect(screen.getByText('(10)')).toBeInTheDocument()
      expect(screen.getByText('(5)')).toBeInTheDocument()
      expect(screen.getByText('(3)')).toBeInTheDocument()
    })

    it('点击标签应该触发回调', () => {
      const onTagSelect = vi.fn()
      render(<Sidebar tags={mockTags} onTagSelect={onTagSelect} />)

      const reactTag = screen.getByText('React')
      fireEvent.click(reactTag)

      expect(onTagSelect).toHaveBeenCalledWith('React')
    })
  })

  describe('选中状态', () => {
    it('选中的标签应该有高亮样式', () => {
      render(<Sidebar tags={mockTags} selectedTag="React" onTagSelect={vi.fn()} />)

      const selectedTag = screen.getByText('React').closest('button')
      expect(selectedTag).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('未选中的标签没有高亮样式', () => {
      render(<Sidebar tags={mockTags} selectedTag="React" onTagSelect={vi.fn()} />)

      const unselectedTag = screen.getByText('Vue').closest('button')
      expect(unselectedTag).not.toHaveClass('bg-primary')
    })
  })

  describe('移动端抽屉', () => {
    it('移动端应该显示抽屉按钮', () => {
      render(<Sidebar tags={mockTags} onTagSelect={vi.fn()} />)

      expect(screen.getByLabelText(/打开筛选/i)).toBeInTheDocument()
    })

    it('点击按钮展开移动端抽屉', () => {
      render(<Sidebar tags={mockTags} onTagSelect={vi.fn()} />)

      const toggleButton = screen.getByLabelText(/打开筛选/i)
      fireEvent.click(toggleButton)

      expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument()
    })

    it('抽屉中应该显示所有标签', () => {
      render(<Sidebar tags={mockTags} onTagSelect={vi.fn()} />)

      const toggleButton = screen.getByLabelText(/打开筛选/i)
      fireEvent.click(toggleButton)

      expect(screen.getByTestId('mobile-drawer')).toHaveTextContent('React')
      expect(screen.getByTestId('mobile-drawer')).toHaveTextContent('Vue')
      expect(screen.getByTestId('mobile-drawer')).toHaveTextContent('Angular')
    })
  })
})
