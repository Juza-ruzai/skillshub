import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api'
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
  ChevronRight,
  AlertCircle,
  Eye,
  Package,
} from 'lucide-react'
import type EasyMDE from 'easymde'
import 'easymde/dist/easymde.min.css'

// 上传步骤类型
type UploadStep = 1 | 2 | 3

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

// 步骤指示器组件
function StepIndicator({
  currentStep,
  completedSteps,
}: {
  currentStep: UploadStep
  completedSteps: UploadStep[]
}) {
  const steps = [
    { num: 1, label: '上传文件' },
    { num: 2, label: '填写信息' },
    { num: 3, label: '预览确认' },
  ]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '32px',
      }}
    >
      {steps.map((step, index) => {
        const isActive = currentStep === step.num
        const isCompleted = completedSteps.includes(step.num as UploadStep)
        const isLast = index === steps.length - 1

        return (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive
                    ? 'var(--btn-gradient)'
                    : isCompleted
                      ? 'var(--accent-primary)'
                      : 'var(--card-bg)',
                  border: `2px solid ${
                    isActive || isCompleted ? 'transparent' : 'var(--card-border)'
                  }`,
                  color: isActive || isCompleted ? 'white' : 'var(--text-tertiary)',
                  fontWeight: 600,
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                }}
              >
                {isCompleted && !isActive ? <Check size={20} /> : step.num}
              </div>
              <span
                style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                style={{
                  width: '60px',
                  height: '2px',
                  background:
                    isCompleted || (currentStep === 2 && step.num === 1)
                      ? 'var(--accent-primary)'
                      : 'var(--card-border)',
                  margin: '0 12px',
                  marginBottom: '20px',
                  transition: 'all 0.3s ease',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// 文件上传区域组件
function UploadZone({
  onFileSelect,
  selectedFile,
  onClearFile,
  isUploading,
  uploadProgress,
  error,
}: {
  onFileSelect: (file: File) => void
  selectedFile: UploadedFile | null
  onClearFile: () => void
  isUploading: boolean
  uploadProgress: number
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
        {isUploading && (
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                height: '6px',
                background: 'var(--ring-bg)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  background: 'var(--btn-gradient)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{
                marginTop: '8px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                textAlign: 'center',
              }}
            >
              上传中... {uploadProgress}%
            </div>
          </div>
        )}
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
        padding: '48px 24px',
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
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'var(--tab-active-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'var(--accent-primary)',
        }}
      >
        <Upload size={28} />
      </div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}
      >
        拖拽文件到此处 或 点击选择文件
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        支持 .zip 压缩包或 .md 单文件，最大 50MB
      </div>
      {error && (
        <div
          style={{
            marginTop: '12px',
            fontSize: '13px',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  )
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
    'preview',
    'guide',
  ],
  placeholder: '开始编写内容...支持 Markdown 语法',
}

// 主页面组件
export default function SkillUpload() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<UploadStep>(1)
  const [completedSteps, setCompletedSteps] = useState<UploadStep[]>([])

  // Step 1 状态
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [createdSkillId, setCreatedSkillId] = useState<string | null>(null)

  // Step 2 状态
  const [metadata, setMetadata] = useState<SkillMetadata>({
    name: '',
    description: '',
    usageScenario: '',
    usageMethod: '',
    tags: [],
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Step 3 状态
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Step 1: 处理文件选择
  const handleFileSelect = (file: File) => {
    setSelectedFile({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    })
    setUploadError(null)
  }

  // Step 1: 清除文件
  const handleClearFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
  }

  // Step 1: 上传文件
  const handleUploadFile = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile.file)
      formData.append('name', selectedFile.name.replace(/\.[^/.]+$/, ''))
      formData.append('description', '暂存描述')
      formData.append('usage_scenario', '暂存使用场景')
      formData.append('usage_method', '暂存使用方法')

      // 模拟进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await apiClient.post('/skills', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      clearInterval(progressInterval)
      setUploadProgress(100)
      setCreatedSkillId(response.data.id)

      // 自动进入下一步
      setTimeout(() => {
        setCompletedSteps([1])
        setCurrentStep(2)
      }, 500)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('上传失败，请重试')
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  // Step 2: 验证表单
  const validateStep2 = (): boolean => {
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

  // Step 3: 提交最终数据
  const handleSubmit = async () => {
    if (!createdSkillId) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await apiClient.put(`/skills/${createdSkillId}`, {
        name: metadata.name,
        description: metadata.description,
        usage_scenario: metadata.usageScenario,
        usage_method: metadata.usageMethod,
        tags: metadata.tags,
      })

      // 跳转到详情页
      navigate(`/skills/${createdSkillId}`)
    } catch (error) {
      console.error('Submit error:', error)
      setSubmitError('保存失败，请重试')
      setIsSubmitting(false)
    }
  }

  // 下一步
  const handleNext = () => {
    if (currentStep === 1) {
      if (!selectedFile) {
        setUploadError('请先选择文件')
        return
      }
      handleUploadFile()
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCompletedSteps([1, 2])
        setCurrentStep(3)
      }
    }
  }

  // 上一步
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as UploadStep)
    }
  }

  // 渲染 Step 1
  const renderStep1 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <UploadZone
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        onClearFile={handleClearFile}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        error={uploadError}
      />
      {selectedFile && !isUploading && uploadProgress === 0 && (
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
          }}
        >
          <Button
            onClick={handleUploadFile}
            style={{
              background: 'var(--btn-gradient)',
              color: 'white',
              padding: '12px 32px',
              fontSize: '15px',
            }}
          >
            <Upload size={18} style={{ marginRight: '8px' }} />
            开始上传
          </Button>
        </div>
      )}
    </div>
  )

  // 渲染 Step 2
  const renderStep2 = () => (
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
            border: validationErrors.name ? '1px solid #ef4444' : '1px solid var(--card-border)',
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

      {/* 详细介绍（使用场景） */}
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
            options={mdEditorOptions}
          />
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
            options={mdEditorOptions}
          />
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
    </div>
  )

  // 渲染 Step 3
  const renderStep3 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 预览卡片 */}
      <div
        style={{
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
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
            <Package size={24} />
          </div>
          <div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {metadata.name}
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: '4px 0 0 0',
              }}
            >
              {metadata.description}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          {metadata.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                padding: '4px 12px',
                background: 'var(--tab-active-bg)',
                border: '1px solid var(--tab-active-border)',
                borderRadius: '20px',
                fontSize: '13px',
                color: 'var(--accent-primary)',
              }}
            >
              {tag}
            </span>
          ))}
          {metadata.tags.length === 0 && (
            <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>暂无标签</span>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.05)',
            borderRadius: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginBottom: '4px',
              }}
            >
              文件
            </div>
            <div
              style={{
                fontSize: '14px',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {selectedFile?.name.endsWith('.zip') ? (
                <FileArchive size={16} />
              ) : (
                <FileText size={16} />
              )}
              {selectedFile?.name}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginBottom: '4px',
              }}
            >
              大小
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
              {selectedFile &&
                (selectedFile.size < 1024 * 1024
                  ? (selectedFile.size / 1024).toFixed(1) + ' KB'
                  : (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB')}
            </div>
          </div>
        </div>
      </div>

      {/* 确认信息 */}
      <div
        style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Eye size={20} style={{ color: 'var(--accent-primary)' }} />
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          提交后将跳转到 Skill 详情页，你可以在详情页查看和编辑
        </span>
      </div>

      {submitError && (
        <Alert
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <AlertCircle size={18} style={{ color: '#ef4444' }} />
          <AlertDescription style={{ color: '#ef4444' }}>{submitError}</AlertDescription>
        </Alert>
      )}
    </div>
  )

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          上传 Skill
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
          分享你的 AI Skill，帮助团队提升效率
        </p>
      </div>

      {/* 步骤指示器 */}
      <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />

      {/* 主内容卡片 */}
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
        {/* 步骤内容 */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

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
            onClick={handlePrev}
            disabled={currentStep === 1}
            style={{
              opacity: currentStep === 1 ? 0.5 : 1,
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronLeft size={18} style={{ marginRight: '6px' }} />
            上一步
          </Button>

          {currentStep === 3 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                background: 'var(--btn-gradient)',
                color: 'white',
                padding: '12px 32px',
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '8px',
                    }}
                  />
                  提交中...
                </>
              ) : (
                <>
                  <Check size={18} style={{ marginRight: '8px' }} />
                  确认提交
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={isUploading}
              style={{
                background: 'var(--btn-gradient)',
                color: 'white',
                padding: '12px 32px',
              }}
            >
              下一步
              <ChevronRight size={18} style={{ marginLeft: '6px' }} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
