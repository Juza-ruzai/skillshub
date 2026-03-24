import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2, UserPlus, Sun, Moon } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

interface FormErrors {
  username?: string
  email?: string
  password?: string
}

type PasswordStrength = 'weak' | 'medium' | 'strong' | null

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (password.length < 6) return null

  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return 'weak'
  if (score === 2) return 'medium'
  return 'strong'
}

const getPasswordStrengthText = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return '弱'
    case 'medium':
      return '中'
    case 'strong':
      return '强'
    default:
      return ''
  }
}

const getPasswordStrengthWidth = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'strong':
      return '100%'
    case 'medium':
      return '66%'
    case 'weak':
      return '33%'
    default:
      return '0%'
  }
}

const getPasswordStrengthGradient = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
    case 'medium':
      return 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)'
    case 'strong':
      return 'var(--btn-gradient)'
    default:
      return 'transparent'
  }
}

export default function Register(): JSX.Element {
  const navigate = useNavigate()
  const { register, isAuthenticated, isLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const passwordStrength = calculatePasswordStrength(formData.password)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (submitError) {
      setSubmitError('')
    }
  }

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setSubmitError('')

    const form = e.target as HTMLFormElement
    const formElements = form.elements as HTMLFormControlsCollection
    const usernameInput = formElements.namedItem('username') as HTMLInputElement
    const emailInput = formElements.namedItem('email') as HTMLInputElement
    const passwordInput = formElements.namedItem('password') as HTMLInputElement

    const username = usernameInput?.value?.trim() || ''
    const email = emailInput?.value?.trim() || ''
    const password = passwordInput?.value || ''

    const newErrors: FormErrors = {}

    if (!username) {
      newErrors.username = '请输入用户名'
    } else if (username.length < 3) {
      newErrors.username = '用户名至少需要3个字符'
    }

    if (!email) {
      newErrors.email = '请输入邮箱'
    } else if (!validateEmail(email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!password) {
      newErrors.password = '请输入密码'
    } else if (password.length < 6) {
      newErrors.password = '密码至少需要6个字符'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    try {
      await register({ username, email, password })
      navigate('/login', {
        state: { email: formData.email.trim() },
      })
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } } }
      const errorMessage = apiError.response?.data?.detail || '注册失败'
      setSubmitError(errorMessage)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* 主题切换按钮 */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-muted)',
        }}
        aria-label="切换主题"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* 注册卡片 */}
      <div
        className="w-full max-w-md rounded-xl p-8"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        {/* 卡片头部 */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ background: 'var(--accent-primary)' }}
          >
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h1
            className="mb-1 text-xl font-semibold"
            style={{
              fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
              color: 'var(--text-primary)',
            }}
          >
            创建账号
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            加入 OpenClaw，开始分享您的 AI Skills
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* 用户名 */}
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="请输入用户名（至少3个字符）"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? 'username-error' : undefined}
              className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
              style={{
                background: 'var(--input-bg)',
                border: errors.username ? '1px solid #ef4444' : '1px solid var(--card-border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                if (!errors.username) {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)'
                }
              }}
              onBlur={(e) => {
                if (!errors.username) {
                  e.currentTarget.style.borderColor = 'var(--card-border)'
                }
              }}
            />
            {errors.username && (
              <p id="username-error" className="text-xs text-red-500">
                {errors.username}
              </p>
            )}
          </div>

          {/* 邮箱 */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="请输入邮箱"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
              style={{
                background: 'var(--input-bg)',
                border: errors.email ? '1px solid #ef4444' : '1px solid var(--card-border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                if (!errors.email) {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)'
                }
              }}
              onBlur={(e) => {
                if (!errors.email) {
                  e.currentTarget.style.borderColor = 'var(--card-border)'
                }
              }}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          {/* 密码 */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="请输入密码（至少6个字符）"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
              style={{
                background: 'var(--input-bg)',
                border: errors.password ? '1px solid #ef4444' : '1px solid var(--card-border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                if (!errors.password) {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)'
                }
              }}
              onBlur={(e) => {
                if (!errors.password) {
                  e.currentTarget.style.borderColor = 'var(--card-border)'
                }
              }}
            />
            {/* 密码强度指示器 */}
            {formData.password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div
                  className="h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: 'var(--ring-bg)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: getPasswordStrengthWidth(passwordStrength),
                      background: getPasswordStrengthGradient(passwordStrength),
                    }}
                  />
                </div>
                {passwordStrength && (
                  <p
                    className="text-xs"
                    style={{
                      color:
                        passwordStrength === 'strong'
                          ? 'var(--accent-secondary)'
                          : passwordStrength === 'medium'
                            ? '#f59e0b'
                            : '#ef4444',
                    }}
                  >
                    密码强度：{getPasswordStrengthText(passwordStrength)}
                  </p>
                )}
              </div>
            )}
            {errors.password && (
              <p id="password-error" className="text-xs text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          {/* 注册按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ background: 'var(--btn-gradient)' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                注册中...
              </span>
            ) : (
              '注册账号'
            )}
          </button>
        </form>

        {/* 底部链接 */}
        <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          已有账号？{' '}
          <Link
            to="/login"
            className="font-medium transition-colors hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            去登录
          </Link>
        </div>
      </div>
    </div>
  )
}
