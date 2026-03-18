import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2 } from 'lucide-react'

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

const getPasswordStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'bg-red-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'strong':
      return 'bg-green-500'
    default:
      return 'bg-gray-200'
  }
}

export default function Register(): JSX.Element {
  const navigate = useNavigate()
  const { register, isAuthenticated, isLoading } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>('')

  // 已登录用户重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const passwordStrength = calculatePasswordStrength(formData.password)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // 清除对应字段的错误
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

    // 直接从表单元素获取值，确保验证时使用的是最新值
    const form = e.target as HTMLFormElement
    const formElements = form.elements as HTMLFormControlsCollection
    const usernameInput = formElements.namedItem('username') as HTMLInputElement
    const emailInput = formElements.namedItem('email') as HTMLInputElement
    const passwordInput = formElements.namedItem('password') as HTMLInputElement

    const username = usernameInput?.value?.trim() || ''
    const email = emailInput?.value?.trim() || ''
    const password = passwordInput?.value || ''

    // 同步执行验证
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
      await register({
        username,
        email,
        password,
      })
      // 注册成功，导航到登录页并预填邮箱
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">注册</CardTitle>
          <CardDescription className="text-center">创建新账号开始分享您的 Skills</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="用户名"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              {errors.username && (
                <p id="username-error" className="text-sm text-red-500">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="邮箱"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="密码"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {formData.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                        style={{
                          width:
                            passwordStrength === 'strong'
                              ? '100%'
                              : passwordStrength === 'medium'
                                ? '66%'
                                : passwordStrength === 'weak'
                                  ? '33%'
                                  : '0%',
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[2rem]">
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-500">已有账号？</span>{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              去登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
