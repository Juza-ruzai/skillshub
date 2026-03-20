import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SkillDetail from './SkillDetail'
import * as authHook from '../hooks/useAuth'
import type { Skill } from '../types/skill'
import type { CommentWithReplies } from '../types/comment'
import type { User } from '../types/user'

// 模拟 useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// 模拟 API 调用
const mockGetSkillDetail = vi.fn()
const mockGetSkillComments = vi.fn()
const mockRateSkill = vi.fn()
const mockToggleFavorite = vi.fn()
const mockDownloadSkill = vi.fn()
const mockDeleteSkill = vi.fn()
const mockPostComment = vi.fn()

vi.mock('../lib/skillsApi', () => ({
  getSkillDetail: (...args: unknown[]) => mockGetSkillDetail(...args),
  getSkillComments: (...args: unknown[]) => mockGetSkillComments(...args),
  rateSkill: (...args: unknown[]) => mockRateSkill(...args),
  toggleFavorite: (...args: unknown[]) => mockToggleFavorite(...args),
  downloadSkill: (...args: unknown[]) => mockDownloadSkill(...args),
  deleteSkill: (...args: unknown[]) => mockDeleteSkill(...args),
}))

vi.mock('../lib/commentsApi', () => ({
  postComment: (...args: unknown[]) => mockPostComment(...args),
}))

// 测试数据
const mockSkill: Skill = {
  id: 'skill-123',
  name: 'PDF Processor',
  description: 'A skill for processing PDF files',
  usageScenario: 'Use when you need to extract text from PDF',
  usageMethod: 'Upload PDF and run the script',
  demoImages: [{ url: '/demo.png', caption: 'Demo' }],
  filePath: '/uploads/skill-123/package.zip',
  fileSize: 1024,
  fileTree: [
    {
      name: 'scripts',
      type: 'directory',
      children: [{ name: 'process.py', type: 'file', path: 'scripts/process.py' }],
    },
    { name: 'README.md', type: 'file', path: 'README.md' },
  ],
  tags: ['pdf', 'automation'],
  authorId: 'user-123',
  authorUsername: 'john_doe',
  isDeleted: false,
  isPinned: false,
  downloadCount: 100,
  viewCount: 500,
  favoriteCount: 50,
  ratingAvg: 4.5,
  ratingCount: 20,
  isFavorite: false,
  userRating: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const mockComments: CommentWithReplies[] = [
  {
    id: 'comment-1',
    skillId: 'skill-123',
    userId: 'user-456',
    username: 'jane_doe',
    content: 'Great skill!',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    replies: [
      {
        id: 'comment-2',
        skillId: 'skill-123',
        userId: 'user-123',
        username: 'john_doe',
        content: 'Thanks!',
        parentId: 'comment-1',
        createdAt: '2026-01-03T00:00:00Z',
        updatedAt: '2026-01-03T00:00:00Z',
        replies: [],
      },
    ],
  },
]

const mockCurrentUser: User = {
  id: 'user-123',
  username: 'john_doe',
  email: 'john@example.com',
  is_admin: false,
  created_at: '2026-01-01T00:00:00Z',
}

const mockOtherUser: User = {
  id: 'user-456',
  username: 'jane_doe',
  email: 'jane@example.com',
  is_admin: false,
  created_at: '2026-01-01T00:00:00Z',
}

// 测试工具函数
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  })

const renderWithProviders = (ui: React.ReactElement, { route = '/skills/skill-123' } = {}) => {
  const queryClient = createTestQueryClient()
  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/skills/:id" element={ui} />
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/skills/:id/edit" element={<div>Edit Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    ),
    queryClient,
  }
}

describe('SkillDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSkillDetail.mockResolvedValue(mockSkill)
    mockGetSkillComments.mockResolvedValue({ items: mockComments, total: 1 })
  })

  // ============================================================================
  // 7.1: 页面加载显示骨架屏
  // ============================================================================
  describe('7.1 Loading Skeleton', () => {
    it('should display skeleton while loading skill data', () => {
      // 延迟响应以测试加载状态
      mockGetSkillDetail.mockImplementation(() => new Promise(() => {}))

      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      })

      renderWithProviders(<SkillDetail />)

      // 验证骨架屏元素存在
      expect(screen.getByTestId('skill-detail-skeleton')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // 7.2: 基本信息完整展示
  // ============================================================================
  describe('7.2 Basic Information Display', () => {
    it('should display complete skill information', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      })

      renderWithProviders(<SkillDetail />)

      // 等待数据加载完成
      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 验证基本信息
      expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      expect(screen.getByText('A skill for processing PDF files')).toBeInTheDocument()
      expect(screen.getByText('Use when you need to extract text from PDF')).toBeInTheDocument()
      expect(screen.getByText('Upload PDF and run the script')).toBeInTheDocument()

      // 验证统计信息
      expect(screen.getByText('500')).toBeInTheDocument() // viewCount
      expect(screen.getByText('100')).toBeInTheDocument() // downloadCount
      expect(screen.getByText('50')).toBeInTheDocument() // favoriteCount

      // 验证作者信息
      expect(screen.getByText('john_doe')).toBeInTheDocument()

      // 验证标签
      expect(screen.getByText('pdf')).toBeInTheDocument()
      expect(screen.getByText('automation')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // 7.3: FileTree 正确展示 Skill 文件结构
  // ============================================================================
  describe('7.3 File Tree Display', () => {
    it('should display file tree section with folders', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 验证文件树部分标题
      expect(screen.getByText('文件结构')).toBeInTheDocument()
      // 验证根文件夹显示
      expect(screen.getByText('scripts')).toBeInTheDocument()
      // 根级文件应该可见
      expect(document.body.textContent).toContain('README.md')
    })

    it('should allow expanding folders to show nested files', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 找到文件夹并点击展开
      const folder = screen.getByText('scripts')
      fireEvent.click(folder)

      // 展开后应该能看到嵌套文件
      await waitFor(() => {
        expect(document.body.textContent).toContain('process.py')
      })
    })
  })

  // ============================================================================
  // 7.4: SKILL.md 正确渲染预览
  // ============================================================================
  describe('7.4 SKILL.md Preview', () => {
    it('should render markdown preview correctly', async () => {
      const skillWithContent = {
        ...mockSkill,
        content: '# Title\n\nThis is **bold** text.',
      }
      mockGetSkillDetail.mockResolvedValue(skillWithContent)

      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 验证 markdown 渲染（具体内容取决于 markdown 渲染实现）
      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // 7.5: 登录用户可评分，评分后更新显示
  // ============================================================================
  describe('7.5 Rating Functionality', () => {
    it('should allow logged-in user to rate skill', async () => {
      mockRateSkill.mockResolvedValue({ success: true })

      vi.mocked(authHook.useAuth).mockReturnValue({
        user: mockOtherUser,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 找到评分组件的交互元素（星星）- 使用 star-rating testid
      const starRating = screen.getByTestId('star-rating')
      expect(starRating).toBeInTheDocument()

      // 找到星星按钮并点击第 5 颗
      const stars = starRating.querySelectorAll('[role="button"]')
      expect(stars.length).toBeGreaterThan(0)
      fireEvent.click(stars[4])

      // 验证评分 API 被调用
      await waitFor(() => {
        expect(mockRateSkill).toHaveBeenCalledWith('skill-123', 5)
      })
    })

    it('should not show rating interaction for guest users', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 游客应该看到只读评分
      expect(screen.getByText('4.5')).toBeInTheDocument()
      expect(screen.getByText('(20 评分)')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // 7.6: 登录用户可收藏/取消收藏
  // ============================================================================
  describe('7.6 Favorite Functionality', () => {
    it('should allow logged-in user to favorite/unfavorite skill', async () => {
      mockToggleFavorite.mockResolvedValue({ isFavorite: true })

      const skillNotFavorited = { ...mockSkill, isFavorite: false }
      mockGetSkillDetail.mockResolvedValue(skillNotFavorited)

      vi.mocked(authHook.useAuth).mockReturnValue({
        user: mockOtherUser,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 找到收藏按钮
      const favoriteButton = screen.getByTestId('favorite-button')
      expect(favoriteButton).toBeInTheDocument()

      // 点击收藏
      fireEvent.click(favoriteButton)

      // 验证收藏 API 被调用
      await waitFor(() => {
        expect(mockToggleFavorite).toHaveBeenCalledWith('skill-123')
      })
    })

    it('should show correct favorite state', async () => {
      const skillFavorited = { ...mockSkill, isFavorite: true }
      mockGetSkillDetail.mockResolvedValue(skillFavorited)

      vi.mocked(authHook.useAuth).mockReturnValue({
        user: mockOtherUser,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 验证已收藏状态
      const favoriteButton = screen.getByTestId('favorite-button')
      expect(favoriteButton).toHaveAttribute('data-favorited', 'true')
    })
  })

  // ============================================================================
  // 7.7: 下载按钮触发下载并增加计数
  // ============================================================================
  describe('7.7 Download Functionality', () => {
    it('should trigger download when download button is clicked', async () => {
      mockDownloadSkill.mockResolvedValue({
        url: 'http://localhost:8000/api/v1/files/skill-123/package.zip',
      })

      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 找到下载按钮
      const downloadButton = screen.getByTestId('download-button')
      expect(downloadButton).toBeInTheDocument()

      // 点击下载
      fireEvent.click(downloadButton)

      // 验证下载 API 被调用
      await waitFor(() => {
        expect(mockDownloadSkill).toHaveBeenCalledWith('skill-123')
      })
    })
  })

  // ============================================================================
  // 7.8: 评论区展示嵌套回复
  // ============================================================================
  describe('7.8 Nested Comments Display', () => {
    it('should display comments section', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 验证评论区标题显示
      expect(document.body.textContent).toContain('Comments')
    })

    it('should show comments count in sidebar', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 验证侧边栏评论统计
      expect(document.body.textContent).toContain('条评论')
    })
  })

  // ============================================================================
  // 7.9: 登录用户可发表评论
  // ============================================================================
  describe('7.9 Post Comment', () => {
    it('should show comment input for logged-in user', async () => {
      mockPostComment.mockResolvedValue({
        id: 'new-comment',
        content: 'New comment',
        username: 'jane_doe',
      })

      vi.mocked(authHook.useAuth).mockReturnValue({
        user: mockOtherUser,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 登录用户应该看到评论输入框 - 使用 Write a comment placeholder
      const commentInput = screen.getByPlaceholderText(/Write a comment/i)
      expect(commentInput).toBeInTheDocument()
    })

    it('should not show comment input for guest users', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 游客应该看到登录提示
      expect(screen.getByText(/登录后发表评论/i)).toBeInTheDocument()
    })
  })

  // ============================================================================
  // 7.10: 作者看到编辑/删除按钮，非作者看不到
  // ============================================================================
  describe('7.10 Author Actions Visibility', () => {
    it('should show edit and delete buttons for author', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: mockCurrentUser, // 与 skill authorId 相同
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 验证编辑按钮存在
      expect(screen.getByTestId('edit-button')).toBeInTheDocument()

      // 验证删除按钮存在
      expect(screen.getByTestId('delete-button')).toBeInTheDocument()
    })

    it('should not show edit and delete buttons for non-author', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: mockOtherUser, // 与 skill authorId 不同
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 验证编辑按钮不存在
      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument()

      // 验证删除按钮不存在
      expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
    })

    it('should not show edit and delete buttons for guest users', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 验证编辑按钮不存在
      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument()

      // 验证删除按钮不存在
      expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
    })
  })

  // ============================================================================
  // 7.11: 删除 Skill 有确认对话框
  // ============================================================================
  describe('7.11 Delete Skill Confirmation', () => {
    it('should show confirmation dialog before deleting skill', async () => {
      mockDeleteSkill.mockResolvedValue({ success: true })

      vi.mocked(authHook.useAuth).mockReturnValue({
        user: mockCurrentUser,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 点击删除按钮
      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)

      // 验证确认对话框显示
      expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument()
      expect(screen.getByText(/确定要删除这个 Skill/i)).toBeInTheDocument()

      // 点击确认删除
      const confirmButton = screen.getByTestId('confirm-delete-button')
      fireEvent.click(confirmButton)

      // 验证删除 API 被调用
      await waitFor(() => {
        expect(mockDeleteSkill).toHaveBeenCalledWith('skill-123')
      })
    })

    it('should allow canceling deletion', async () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: mockCurrentUser,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: true,
      })

      renderWithProviders(<SkillDetail />)

      await waitFor(() => {
        expect(screen.getByText('PDF Processor')).toBeInTheDocument()
      })

      // 点击删除按钮
      const deleteButton = screen.getByTestId('delete-button')
      fireEvent.click(deleteButton)

      // 验证确认对话框显示
      expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument()

      // 点击取消
      const cancelButton = screen.getByTestId('cancel-delete-button')
      fireEvent.click(cancelButton)

      // 验证对话框关闭且删除 API 未被调用
      expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument()
      expect(mockDeleteSkill).not.toHaveBeenCalled()
    })
  })
})
