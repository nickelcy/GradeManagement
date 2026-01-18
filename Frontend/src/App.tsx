import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { UserProvider } from './context/UserContext'
import { YearProvider } from './context/YearContext'
import './pages/page.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboard from './pages/admin/AdminDashboard'
import Users from './pages/admin/Users'
import Students from './pages/admin/Students'
import StudentReport from './pages/admin/StudentReports'
import SubjectReport from './pages/admin/SubjectReport'
import Login from './pages/auth/Login'
import TeacherDashboard from './pages/teacher/TeacherDashboard'

const AppContent = () => {
  const { token, roleId } = useAuth()
  if (!token) {
    return <Login />
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={roleId === 1 ? <AdminDashboard /> : <TeacherDashboard />}
        />
        <Route
          path="/staff"
          element={roleId === 1 ? <Users /> : <Navigate to="/" replace />}
        />
        <Route
          path="/students"
          element={roleId === 1 ? <Students /> : <Navigate to="/" replace />}
        />
        <Route
          path="/studentreports"
          element={roleId === 1 ? <StudentReport /> : <Navigate to="/" replace />}
        />        
        <Route
          path="/subjectreport"
          element={roleId === 1 ? <SubjectReport /> : <Navigate to="/" replace />}
        />   
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <YearProvider>
          <AppContent />
        </YearProvider>
      </UserProvider>
    </AuthProvider>
  )
}

export default App
