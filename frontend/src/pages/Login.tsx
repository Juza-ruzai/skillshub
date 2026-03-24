import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2, LogIn } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

interface FormErrors {
  email?: string
  password?: string
}

interface LocationState {
  email?: string
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function Login(): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const state = location.state as LocationState

  const [formData, setFormData] = useState({
    email: state?.email || '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (state?.email) {
      setFormData((prev) => ({ ...prev, email: state.email as string }))
    }
  }, [state?.email])

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
    const emailInput = formElements.namedItem('email') as HTMLInputElement
    const passwordInput = formElements.namedItem('password') as HTMLInputElement

    const email = emailInput?.value?.trim() || ''
    const password = passwordInput?.value || ''

    const newErrors: FormErrors = {}

    if (!email) {
      newErrors.email = '请输入邮箱'
    } else if (!validateEmail(email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!password) {
      newErrors.password = '请输入密码'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    try {
      await login({ email, password })
      navigate('/')
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { detail?: string } } }
      const errorMessage = apiError.response?.data?.detail || '登录失败'
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

      {/* 登录卡片 */}
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
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h1
            className="mb-1 text-xl font-semibold"
            style={{
              fontFamily: "'Space Grotesk', 'Noto Sans SC', sans-serif",
              color: 'var(--text-primary)',
            }}
          >
            欢迎回来
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            输入您的邮箱和密码登录账号
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

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
              placeholder="请输入密码"
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
            {errors.password && (
              <p id="password-error" className="text-xs text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ background: 'var(--btn-gradient)' }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                登录中...
              </span>
            ) : (
              '登录'
            )}
          </button>
        </form>

        {/* 底部链接 */}
        <div className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          还没有账号？{' '}
          <Link
            to="/register"
            className="font-medium transition-colors hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            去注册
          </Link>
        </div>
      </div>
    </div>
  )
}
