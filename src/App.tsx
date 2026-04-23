import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import StudentApplication from './pages/StudentApplication'
import StudentRegister from './pages/StudentRegister'
import MyDashboard from './pages/MyDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/my-dashboard" element={<MyDashboard />} />
        <Route path="/student" element={<StudentApplication />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


