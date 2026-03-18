import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './components/PrivateRoute'

// 页面组件（将在后续 Phase 中实现）
const Home = () => <div>Home Page</div>
const Login = () => <div>Login Page</div>
const Register = () => <div>Register Page</div>
const SkillDetail = () => <div>Skill Detail</div>
const SkillUpload = () => <div>Skill Upload</div>
const SkillEdit = () => <div>Skill Edit</div>
const UserProfile = () => <div>User Profile</div>
const NotFound = () => <div>404 Not Found</div>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公开路由 */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Home />} />
        <Route path="/skills/:id" element={<SkillDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 需要登录的路由 */}
        <Route element={<PrivateRoute />}>
          <Route path="/upload" element={<SkillUpload />} />
          <Route path="/skills/:id/edit" element={<SkillEdit />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/skills" element={<UserProfile />} />
          <Route path="/profile/favorites" element={<UserProfile />} />
          <Route path="/profile/comments" element={<UserProfile />} />
        </Route>

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
