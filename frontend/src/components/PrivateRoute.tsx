import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const PrivateRoute = (): JSX.Element => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          data-testid="loading"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export const AdminRoute = (): JSX.Element => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          data-testid="loading"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        />
      </div>
    )
  }

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
