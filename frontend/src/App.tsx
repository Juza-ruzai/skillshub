import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivateRoute } from './components/PrivateRoute'
import { Layout } from './components/layout/Layout'

import { Home } from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SkillDetail from './pages/SkillDetail'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const SkillUpload = () => <div>Skill Upload</div>
const SkillEdit = () => <div>Skill Edit</div>
const UserProfile = () => <div>User Profile</div>
const NotFound = () => <div>404 Not Found</div>

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Layout-wrapped routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Home />} />
            <Route path="/skills/:id" element={<SkillDetail />} />

            {/* Private routes inside layout */}
            <Route element={<PrivateRoute />}>
              <Route path="/upload" element={<SkillUpload />} />
              <Route path="/skills/:id/edit" element={<SkillEdit />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/profile/skills" element={<UserProfile />} />
              <Route path="/profile/favorites" element={<UserProfile />} />
              <Route path="/profile/comments" element={<UserProfile />} />
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
