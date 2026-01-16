import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { UserProvider } from './context/UserContext'
import './pages/page.css'
import AdminDashboard from './pages/admin/AdminDashboard'
import Login from './pages/auth/Login'
import TeacherDashboard from './pages/teacher/TeacherDashboard'

const AppContent = () => {
  const { token, roleId } = useAuth()
  if (!token) {
    return <Login />
  }
  return roleId === 1 ? <AdminDashboard /> : <TeacherDashboard />
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </AuthProvider>
  )
}

export default App
