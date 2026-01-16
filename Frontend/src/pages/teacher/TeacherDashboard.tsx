import { TeacherSidebar } from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'

const TeacherDashboard = () => {
  const { userId, logout } = useAuth()

  return (
    <main className="dashboard-layout">
      <TeacherSidebar userId={userId} onLogout={logout} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-role">Teacher</p>
            <p className="dashboard-user">User #{userId ?? '—'}</p>
          </div>
        </header>
        <section className="dashboard-content">
          <h1>Teacher Dashboard</h1>
          <p className="dashboard-subtitle">
            Track classes, submit grades, and review reports.
          </p>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h2>My Students</h2>
              <p>Review student details and performance.</p>
            </div>
            <div className="dashboard-card">
              <h2>Grade Entry</h2>
              <p>Enter scores for current grading periods.</p>
            </div>
            <div className="dashboard-card">
              <h2>Reports</h2>
              <p>Generate printable classroom reports.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default TeacherDashboard
