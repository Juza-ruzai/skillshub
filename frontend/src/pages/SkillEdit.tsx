import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import { uploadContentImage, uploadCover } from '../lib/skillsApi'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Alert, AlertDescription } from '../components/ui/alert'
import SimpleMDE from 'react-simplemde-editor'
import {
  Upload,
  FileArchive,
  FileText,
  X,
  Check,
  ChevronLeft,
  AlertCircle,
  Package,
  RotateCcw,
  Loader2,
  ImagePlus,
} from 'lucide-react'
import type EasyMDE from 'easymde'
import 'easymde/dist/easymde.min.css'
import { MarkdownPreview } from '../components/common/MarkdownPreview'

// 文件类型
interface UploadedFile {
  file: File
  name: string
  size: number
  type: string
}

// Skill 元数据
interface SkillMetadata {
  name: string
  description: string
  usageScenario: string
  usageMethod: string
  tags: string[]
}

// 标签输入组件
function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const addTag = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      onChange([...tags, trimmed])
      setInputValue('')
    }
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--card-border)',
        borderRadius: '12px',
        padding: '8px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        minHeight: '44px',
        alignItems: 'center',
      }}
    >
      {tags.map((tag, index) => (
        <span
          key={index}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            background: 'var(--tab-active-bg)',
            border: '1px solid var(--tab-active-border)',
            borderRadius: '20px',
            fontSize: '13px',
            color: 'var(--accent-primary)',
          }}
        >
          {tag}
          <button
            onClick={() => removeTag(index)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              color: 'inherit',
            }}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? '输入标签，按回车或逗号添加' : ''}
        style={{
          border: 'none',
          background: 'transparent',
          outline: 'none',
          fontSize: '14px',
          color: 'var(--text-primary)',
          flex: 1,
          minWidth: '120px',
        }}
      />
    </div>
  )
}

// 文件上传区域组件
function UploadZone({
  onFileSelect,
  selectedFile,
  onClearFile,
  isUploading,
  error,
}: {
  onFileSelect: (file: File) => void
  selectedFile: UploadedFile | null
  onClearFile: () => void
  isUploading: boolean
  error: string | null
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateAndSelectFile = useCallback(
    (file: File) => {
      const validTypes = ['.zip', '.md']
      const fileName = file.name.toLowerCase()
      const isValid = validTypes.some((type) => fileName.endsWith(type))

      if (!isValid) {
        alert('请上传 .zip 或 .md 文件')
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        alert('文件大小不能超过 50MB')
        return
      }

      onFileSelect(file)
    },
    [onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = e.dataTransfer.files
      if (files.length > 0) {
        validateAndSelectFile(files[0])
      }
    },
    [validateAndSelectFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        validateAndSelectFile(files[0])
      }
    },
    [validateAndSelectFile]
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (selectedFile) {
    return (
      <div
        style={{
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--tab-active-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            {selectedFile.name.endsWith('.zip') ? (
              <FileArchive size={24} />
            ) : (
              <FileText size={24} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}
            >
              {selectedFile.name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {formatFileSize(selectedFile.size)}
            </div>
          </div>
          {!isUploading && (
            <button
              onClick={onClearFile}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-tertiary)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                e.currentTarget.style.color = '#ef4444'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-tertiary)'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        background: isDragging ? 'rgba(59, 130, 246, 0.08)' : 'var(--card-bg)',
        backdropFilter: 'blur(20px)',
        border: `2px dashed ${
          isDragging ? 'var(--accent-primary)' : error ? '#ef4444' : 'var(--card-border)'
        }`,
        borderRadius: '16px',
        padding: '32px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,.md"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'var(--tab-active-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          color: 'var(--accent-primary)',
        }}
      >
        <Upload size={24} />
      </div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '4px',
        }}
      >
        拖拽文件到此处 或 点击选择文件
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        支持 .zip 压缩包或 .md 单文件，最大 50MB
      </div>
    </div>
  )
}

// Markdown 编辑器配置
const mdEditorOptions: EasyMDE.Options = {
  spellChecker: false,
  status: false,
  toolbar: [
    'bold',
    'italic',
    'heading',
    '|',
    'quote',
    'unordered-list',
    'ordered-list',
    '|',
    'link',
    'image',
    '|',
    'guide',
  ],
  placeholder: '开始编写内容...支持 Markdown 语法\n\n💡 提示：可直接拖拽或粘贴图片到编辑器中',
  uploadImage: true,
}

// 主页面组件
export default function SkillEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // 获取 Skill 详情
  const {
    data: skill,
    isLoading: isLoadingSkill,
    error: skillError,
  } = useQuery({
    queryKey: ['skill', id],
    queryFn: async () => {
      const response = await apiClient.get(`/skills/${id}`)
      return response.data
    },
    enabled: !!id,
  })

  // 权限检查：非作者重定向
  useEffect(() => {
    if (skill && user) {
      const isAuthor = user.id === skill.author_id
      if (!isAuthor) {
        navigate('/')
      }
    }
  }, [skill, user, navigate])

  // 表单状态
  const [metadata, setMetadata] = useState<SkillMetadata>({
    name: '',
    description: '',
    usageScenario: '',
    usageMethod: '',
    tags: [],
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // 文件重新上传
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // 封面图片状态
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // 保存状态和 Toast
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // 预填充表单
  useEffect(() => {
    if (skill) {
      setMetadata({
        name: skill.name || '',
        description: skill.description || '',
        usageScenario: skill.usage_scenario || '',
        usageMethod: skill.usage_method || '',
        tags: skill.tags || [],
      })
      // 预填充封面
      if (skill.cover_url) {
        setCoverPreview(skill.cover_url)
      }
    }
  }, [skill])

  // 处理文件选择
  const handleFileSelect = (file: File) => {
    setSelectedFile({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    })
    setUploadError(null)
  }

  const handleClearFile = () => {
    setSelectedFile(null)
  }

  // 封面图片处理
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('只支持 jpg、png、webp 格式的图片')
      return
    }

    // 验证文件大小
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB')
      return
    }

    setCoverFile(file)

    // 创建预览
    const reader = new FileReader()
    reader.onload = (event) => {
      setCoverPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadCover = async () => {
    if (!coverFile || !id) return

    setIsUploadingCover(true)
    try {
      await uploadCover(id, coverFile)
      // 刷新数据
      queryClient.invalidateQueries({ queryKey: ['skill', id] })
      // 重新从服务器获取最新封面 URL
      setCoverFile(null)
    } catch (error) {
      console.error('Cover upload error:', error)
      alert('封面上传失败，请重试')
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleRemoveCover = () => {
    setCoverFile(null)
    // 如果是本地预览（新选择的文件），清除预览；如果是已保存的封面，恢复显示
    if (skill?.cover_url && coverPreview === skill.cover_url) {
      // 不做任何操作，保持显示
    } else if (!skill?.cover_url) {
      setCoverPreview(null)
    } else {
      setCoverPreview(skill.cover_url)
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = ''
    }
  }

  // 验证表单
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!metadata.name.trim()) {
      errors.name = '请输入 Skill 名称'
    } else if (metadata.name.length > 50) {
      errors.name = '名称不能超过 50 字'
    }

    if (!metadata.description.trim()) {
      errors.description = '请输入描述'
    } else if (metadata.description.length < 10) {
      errors.description = '描述至少需要 10 字'
    } else if (metadata.description.length > 50) {
      errors.description = '描述不能超过 50 字'
    }

    if (!metadata.usageScenario.trim()) {
      errors.usageScenario = '请输入详细介绍'
    }

    if (!metadata.usageMethod.trim()) {
      errors.usageMethod = '请输入使用方法'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 保存修改
  const handleSave = async () => {
    if (!id || !validateForm()) return

    setIsSaving(true)
    setSaveError(null)

    try {
      // 先更新元数据
      await apiClient.put(`/skills/${id}`, {
        name: metadata.name,
        description: metadata.description,
        usage_scenario: metadata.usageScenario,
        usage_method: metadata.usageMethod,
        tags: metadata.tags,
      })

      // 如果有重新上传文件
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile.file)
        formData.append('name', metadata.name)
        formData.append('description', metadata.description)
        formData.append('usage_scenario', metadata.usageScenario)
        formData.append('usage_method', metadata.usageMethod)
        formData.append('tags', JSON.stringify(metadata.tags))

        await apiClient.post(`/skills/${id}/reupload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }

      // 刷新缓存
      queryClient.invalidateQueries({ queryKey: ['skill', id] })

      // 显示成功 Toast
      setShowSuccessToast(true)
      setTimeout(() => {
        navigate(`/skills/${id}`)
      }, 1500)
    } catch (error: unknown) {
      console.error('Save error:', error)
      const apiError = error as { response?: { data?: { detail?: string } } }
      setSaveError(apiError.response?.data?.detail || '保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    navigate(`/skills/${id}`)
  }

  // 稳定的 Markdown 编辑器配置（带图片上传，必须在所有 early return 之前声明）
  const mdEditorOptionsScenario = useMemo(
    () => ({
      ...mdEditorOptions,
      imageUploadFunction: id
        ? (file: File, onSuccess: (url: string) => void, onError: (error: string) => void) => {
            uploadContentImage(id, file)
              .then((data) => onSuccess(data.url))
              .catch((error: unknown) =>
                onError(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
              )
          }
        : undefined,
    }),
    [id]
  )
  const mdEditorOptionsMethod = useMemo(
    () => ({
      ...mdEditorOptions,
      imageUploadFunction: id
        ? (file: File, onSuccess: (url: string) => void, onError: (error: string) => void) => {
            uploadContentImage(id, file)
              .then((data) => onSuccess(data.url))
              .catch((error: unknown) =>
                onError(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
              )
          }
        : undefined,
    }),
    [id]
  )

  // 加载骨架屏
  if (isLoadingSkill) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            编辑 Skill
          </h1>
        </div>
        <div
          style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--card-border)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div
                  style={{
                    width: '100px',
                    height: '16px',
                    background: 'var(--skeleton-bg)',
                    borderRadius: '4px',
                    marginBottom: '8px',
                  }}
                />
                <div
                  style={{
                    width: '100%',
                    height: '44px',
                    background: 'var(--skeleton-bg)',
                    borderRadius: '8px',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 加载错误
  if (skillError) {
    return (
      <div
        style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
      >
        <div
          style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            padding: '48px 32px',
          }}
        >
          <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            加载失败
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            无法加载 Skill 信息
          </p>
          <Button
            onClick={handleCancel}
            style={{ background: 'var(--btn-gradient)', color: 'white' }}
          >
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 成功 Toast */}
      {showSuccessToast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            zIndex: 1000,
            animation: 'slideDown 0.3s ease',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={16} style={{ color: '#22c55e' }} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
            保存成功
          </span>
        </div>
      )}

      {/* 页面标题 */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          编辑 Skill
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>更新你的 Skill 信息</p>
      </div>

      {/* 主表单卡片 */}
      <div
        style={{
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--card-border)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 名称 */}
          <div>
            <Label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Skill 名称 <span style={{ color: '#ef4444' }}>*</span>
            </Label>
            <Input
              value={metadata.name}
              onChange={(e) => setMetadata((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="给你的 Skill 起个名字"
              maxLength={50}
              style={{
                background: 'var(--card-bg)',
                border: validationErrors.name
                  ? '1px solid #ef4444'
                  : '1px solid var(--card-border)',
              }}
            />
            {validationErrors.name && (
              <div
                style={{
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <AlertCircle size={14} />
                {validationErrors.name}
              </div>
            )}
          </div>

          {/* 描述 */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <Label
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                简短描述 <span style={{ color: '#ef4444' }}>*</span>
              </Label>
              <span
                style={{
                  fontSize: '12px',
                  color:
                    metadata.description.length < 10 || metadata.description.length > 50
                      ? '#ef4444'
                      : 'var(--text-tertiary)',
                }}
              >
                {metadata.description.length} / 10-50 字
              </span>
            </div>
            <Input
              value={metadata.description}
              onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="一句话描述这个 Skill 的作用，用于搜索结果展示"
              maxLength={50}
              style={{
                background: 'var(--card-bg)',
                border: validationErrors.description
                  ? '1px solid #ef4444'
                  : '1px solid var(--card-border)',
              }}
            />
            {validationErrors.description && (
              <div
                style={{
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <AlertCircle size={14} />
                {validationErrors.description}
              </div>
            )}
          </div>

          {/* 详细介绍 */}
          <div>
            <Label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              详细介绍（使用场景、效果演示等） <span style={{ color: '#ef4444' }}>*</span>
            </Label>
            <div
              className="markdown-editor-container"
              style={{
                border: validationErrors.usageScenario
                  ? '1px solid #ef4444'
                  : '1px solid var(--card-border)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <SimpleMDE
                value={metadata.usageScenario}
                onChange={(value) => setMetadata((prev) => ({ ...prev, usageScenario: value }))}
                options={mdEditorOptionsScenario}
              />
            </div>
            <div
              style={{
                marginTop: '8px',
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '6px 12px',
                  borderBottom: '1px solid var(--card-border)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  background: 'rgba(59,130,246,0.04)',
                }}
              >
                预览
              </div>
              <div style={{ padding: '12px 16px', minHeight: '60px' }}>
                {metadata.usageScenario.trim() ? (
                  <MarkdownPreview content={metadata.usageScenario} />
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
                    在上方输入内容后，预览将在此显示…
                  </span>
                )}
              </div>
            </div>
            {validationErrors.usageScenario && (
              <div
                style={{
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <AlertCircle size={14} />
                {validationErrors.usageScenario}
              </div>
            )}
          </div>

          {/* 使用方法 */}
          <div>
            <Label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              使用方法 <span style={{ color: '#ef4444' }}>*</span>
            </Label>
            <div
              className="markdown-editor-container"
              style={{
                border: validationErrors.usageMethod
                  ? '1px solid #ef4444'
                  : '1px solid var(--card-border)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <SimpleMDE
                value={metadata.usageMethod}
                onChange={(value) => setMetadata((prev) => ({ ...prev, usageMethod: value }))}
                options={mdEditorOptionsMethod}
              />
            </div>
            <div
              style={{
                marginTop: '8px',
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '6px 12px',
                  borderBottom: '1px solid var(--card-border)',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  background: 'rgba(59,130,246,0.04)',
                }}
              >
                预览
              </div>
              <div style={{ padding: '12px 16px', minHeight: '60px' }}>
                {metadata.usageMethod.trim() ? (
                  <MarkdownPreview content={metadata.usageMethod} />
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
                    在上方输入内容后，预览将在此显示…
                  </span>
                )}
              </div>
            </div>
            {validationErrors.usageMethod && (
              <div
                style={{
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <AlertCircle size={14} />
                {validationErrors.usageMethod}
              </div>
            )}
          </div>

          {/* 标签 */}
          <div>
            <Label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              标签
            </Label>
            <TagInput
              tags={metadata.tags}
              onChange={(tags) => setMetadata((prev) => ({ ...prev, tags }))}
            />
            <div
              style={{
                marginTop: '6px',
                fontSize: '12px',
                color: 'var(--text-tertiary)',
              }}
            >
              最多 10 个标签，用于搜索和分类
            </div>
          </div>

          {/* 封面图片 */}
          <div>
            <Label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              封面图片{' '}
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(可选)</span>
            </Label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverSelect}
              style={{ display: 'none' }}
            />
            {coverPreview ? (
              <div
                style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--card-border)',
                }}
              >
                <img
                  src={coverPreview}
                  alt="封面预览"
                  style={{
                    width: '100%',
                    aspectRatio: '16/9',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  {coverFile && (
                    <button
                      type="button"
                      onClick={handleUploadCover}
                      disabled={isUploadingCover}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--btn-gradient)',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: isUploadingCover ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isUploadingCover ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          上传中...
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          上传封面
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    disabled={isUploadingCover}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  borderRadius: '12px',
                  border: '2px dashed var(--card-border)',
                  background: 'var(--card-bg)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: 'var(--text-tertiary)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)'
                  e.currentTarget.style.color = 'var(--accent-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--card-border)'
                  e.currentTarget.style.color = 'var(--text-tertiary)'
                }}
              >
                <ImagePlus size={32} />
                <span style={{ fontSize: '14px' }}>点击上传封面图片</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  支持 jpg、png、webp，建议 16:9 比例，最大 2MB
                </span>
              </button>
            )}
          </div>

          {/* 文件重新上传（可选） */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid var(--card-border)' }}>
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <RotateCcw size={16} />
              重新上传文件
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                （可选）
              </span>
            </button>

            {showFileUpload && (
              <div style={{ marginTop: '16px' }}>
                {/* 当前文件信息 */}
                {skill?.file_path && !selectedFile && (
                  <div
                    style={{
                      background: 'rgba(59, 130, 246, 0.05)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <Package size={20} style={{ color: 'var(--accent-primary)' }} />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}
                      >
                        当前文件
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {skill.file_path.split('/').pop() || '已上传文件'}
                      </div>
                    </div>
                  </div>
                )}

                {/* 上传区域 */}
                <UploadZone
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  onClearFile={handleClearFile}
                  isUploading={false}
                  error={uploadError}
                />
              </div>
            )}
          </div>

          {/* 保存错误提示 */}
          {saveError && (
            <Alert
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <AlertCircle size={18} style={{ color: '#ef4444' }} />
              <AlertDescription style={{ color: '#ef4444' }}>{saveError}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* 底部按钮 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid var(--card-border)',
          }}
        >
          <Button
            variant="outline"
            onClick={handleCancel}
            style={{
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronLeft size={18} style={{ marginRight: '6px' }} />
            取消
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              background: 'var(--btn-gradient)',
              color: 'white',
              padding: '12px 32px',
            }}
          >
            {isSaving ? (
              <>
                <Loader2
                  size={18}
                  style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }}
                />
                保存中...
              </>
            ) : (
              <>
                <Check size={18} style={{ marginRight: '8px' }} />
                保存修改
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 全局动画样式 */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
