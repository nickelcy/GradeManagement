import { AdminSidebar } from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'

const AdminDashboard = () => {
  const { userId, logout } = useAuth()

  return (
    <main className="dashboard-layout">
      <AdminSidebar userId={userId} onLogout={logout} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-role">Administrator</p>
            <p className="dashboard-user">User #{userId ?? '—'}</p>
          </div>
        </header>
        <section className="dashboard-content">
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage academic years, staff, students, and grade reporting.
          </p>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h2>Academic Year</h2>
              <p>Open or update the active academic year.</p>
            </div>
            <div className="dashboard-card">
              <h2>Staff Users</h2>
              <p>Create and update staff accounts and roles.</p>
            </div>
            <div className="dashboard-card">
              <h2>Reports</h2>
              <p>Review reports across all grades.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default AdminDashboard
