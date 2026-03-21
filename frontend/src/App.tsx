import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivateRoute } from './components/PrivateRoute'
import { AdminRoute } from './components/AdminRoute'
import { Layout } from './components/layout/Layout'

import { Home } from './pages/Home'
import { SearchResults } from './pages/SearchResults'
import Login from './pages/Login'
import Register from './pages/Register'
import SkillDetail from './pages/SkillDetail'
import SkillUpload from './pages/SkillUpload'
import SkillEdit from './pages/SkillEdit'
import UserProfile from './pages/UserProfile'
import UserSkills from './pages/UserSkills'
import UserFavorites from './pages/UserFavorites'
import UserComments from './pages/UserComments'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSkills from './pages/admin/AdminSkills'
import AdminUsers from './pages/admin/AdminUsers'
import AdminComments from './pages/admin/AdminComments'
import AdminStats from './pages/admin/AdminStats'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const NotFound = () => <div>404 Not Found</div>

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Layout-wrapped routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/skills/:id" element={<SkillDetail />} />

            {/* Private routes inside layout */}
            <Route element={<PrivateRoute />}>
              <Route path="/upload" element={<SkillUpload />} />
              <Route path="/skills/:id/edit" element={<SkillEdit />} />
              <Route path="/profile" element={<UserProfile />}>
                <Route index element={<Navigate to="skills" replace />} />
                <Route path="skills" element={<UserSkills />} />
                <Route path="favorites" element={<UserFavorites />} />
                <Route path="comments" element={<UserComments />} />
              </Route>
            </Route>
          </Route>

          {/* Admin routes (no main layout, own sidebar) */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/skills" element={<AdminSkills />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/comments" element={<AdminComments />} />
              <Route path="/admin/stats" element={<AdminStats />} />
            </Route>
          </Route>

          {/* Standalone routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
