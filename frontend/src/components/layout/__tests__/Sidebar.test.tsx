import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Sidebar } from '../Sidebar'
import { apiClient } from '@/lib/api'

// Mock API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const mockedApiGet = vi.mocked(apiClient.get)

describe('Sidebar', () => {
  const mockTags = {
    items: [
      { id: '1', name: 'React', usageCount: 10 },
      { id: '2', name: 'Vue', usageCount: 5 },
      { id: '3', name: 'Angular', usageCount: 3 },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('标签云展示', () => {
    it('应该显示所有标签', async () => {
      mockedApiGet.mockResolvedValueOnce({ data: mockTags })

      render(<Sidebar />)

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument()
      })
      expect(screen.getByText('Vue')).toBeInTheDocument()
      expect(screen.getByText('Angular')).toBeInTheDocument()
    })

    it('应该显示标签使用次数', async () => {
      mockedApiGet.mockResolvedValueOnce({ data: mockTags })

      render(<Sidebar />)

      await waitFor(() => {
        expect(screen.getByText('(10)')).toBeInTheDocument()
      })
      expect(screen.getByText('(5)')).toBeInTheDocument()
      expect(screen.getByText('(3)')).toBeInTheDocument()
    })

    it('点击标签应该触发回调', async () => {
      mockedApiGet.mockResolvedValueOnce({ data: mockTags })
      const onTagSelect = vi.fn()

      render(<Sidebar onTagSelect={onTagSelect} />)

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument()
      })

      const reactTag = screen.getByText('React')
      fireEvent.click(reactTag)

      expect(onTagSelect).toHaveBeenCalledWith('React')
    })

    it('onTagClick 也应该触发回调', async () => {
      mockedApiGet.mockResolvedValueOnce({ data: mockTags })
      const onTagClick = vi.fn()

      render(<Sidebar onTagClick={onTagClick} />)

      await waitFor(() => {
        expect(screen.getByText('React')).toBeInTheDocument()
      })

      const reactTag = screen.getByText('React')
      fireEvent.click(reactTag)

      expect(onTagClick).toHaveBeenCalledWith('React')
    })
  })

  describe('选中状态', () => {
    it('选中的标签应该有高亮样式', async () => {
      mockedApiGet.mockResolvedValueOnce({ data: mockTags })

      render(<Sidebar selectedTag="React" />)

      await waitFor(() => {
        const selectedTag = screen.getByText('React').closest('button')
        expect(selectedTag).toHaveClass('bg-primary', 'text-primary-foreground')
      })
    })

    it('未选中的标签没有高亮样式', async () => {
      mockedApiGet.mockResolvedValueOnce({ data: mockTags })

      render(<Sidebar selectedTag="React" />)

      await waitFor(() => {
        const unselectedTag = screen.getByText('Vue').closest('button')
        expect(unselectedTag).not.toHaveClass('bg-primary')
      })
    })
  })

  describe('移动端抽屉', () => {
    it('移动端应该显示抽屉按钮', async () => {
      mockedApiGet.mockResolvedValueOnce({ data: mockTags })

      render(<Sidebar />)

      expect(screen.getByLabelText(/打开筛选/i)).toBeInTheDocument()
    })

    it('点击按钮展开移动端抽屉', async () => {
      mockedApiGet.mockResolvedValueOnce({ data: mockTags })

      render(<Sidebar />)

      const toggleButton = screen.getByLabelText(/打开筛选/i)
      fireEvent.click(toggleButton)

      expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument()
    })

    it('抽屉中应该显示所有标签', async () => {
      mockedApiGet.mockResolvedValueOnce({ data: mockTags })

      render(<Sidebar />)

      const toggleButton = screen.getByLabelText(/打开筛选/i)
      fireEvent.click(toggleButton)

      await waitFor(() => {
        expect(screen.getByTestId('mobile-drawer')).toHaveTextContent('React')
      })
      expect(screen.getByTestId('mobile-drawer')).toHaveTextContent('Vue')
      expect(screen.getByTestId('mobile-drawer')).toHaveTextContent('Angular')
    })
  })

  describe('加载状态', () => {
    it('应该显示加载状态', () => {
      // Delay the response
      mockedApiGet.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: mockTags }), 100))
      )

      render(<Sidebar />)

      expect(screen.getByText('加载中...')).toBeInTheDocument()
    })
  })

  describe('错误处理', () => {
    it('API 失败时应该显示空状态', async () => {
      mockedApiGet.mockRejectedValueOnce(new Error('Failed'))

      render(<Sidebar />)

      await waitFor(() => {
        expect(screen.getByText('暂无标签')).toBeInTheDocument()
      })
    })
  })
})
