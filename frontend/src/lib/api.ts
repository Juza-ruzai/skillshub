import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Token 管理
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token)
}

export const clearAuthToken = (): void => {
  localStorage.removeItem('token')
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token')
}

// 请求拦截器 - 添加 Authorization Header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 处理 Token 刷新
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

const addRefreshSubscriber = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback)
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // 等待刷新完成
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        )

        const { access_token } = refreshResponse.data
        setAuthToken(access_token)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }

        onTokenRefreshed(access_token)
        return apiClient(originalRequest)
      } catch (refreshError) {
        clearAuthToken()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// 导出类型
export type ApiError = AxiosError<{
  detail?: string
  message?: string
}>
