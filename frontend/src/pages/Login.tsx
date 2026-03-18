import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Loader2 } from 'lucide-react'

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
  const state = location.state as LocationState

  const [formData, setFormData] = useState({
    email: state?.email || '',
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

  // 预填邮箱
  useEffect(() => {
    if (state?.email) {
      setFormData((prev) => ({ ...prev, email: state.email as string }))
    }
  }, [state?.email])

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
    const emailInput = formElements.namedItem('email') as HTMLInputElement
    const passwordInput = formElements.namedItem('password') as HTMLInputElement

    const email = emailInput?.value?.trim() || ''
    const password = passwordInput?.value || ''

    // 同步执行验证
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">登录</CardTitle>
          <CardDescription className="text-center">输入您的邮箱和密码登录账号</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

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
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-500">还没有账号？</span>{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              去注册
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
