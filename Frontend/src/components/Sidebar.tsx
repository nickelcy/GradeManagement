import { useState } from 'react'
import { FiLogOut, FiUser } from 'react-icons/fi'
import { Profile } from './sidebar/Profile'
import { useUser } from '../context/UserContext'
import './Sidebar.css'
import { Year } from './sidebar/Year'

type SidebarProps = {
  userId: number | null
  onLogout: () => void
}

export const AdminSidebar = ({ userId, onLogout }: SidebarProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { profile } = useUser()

  return (
    <>
      <aside className="dashboard-sidebar admin-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-role">Administrator</div>
          <nav className="nav-links">
            <Year />
            <button type="button" className="nav-link">
              Staff Users
            </button>
            <button type="button" className="nav-link">
              Students
            </button>
            <button type="button" className="nav-link">
              Reports
            </button>
            <div className="nav-group">
              <span className="nav-title">Grades</span>
              <div className="nav-sub">
                {['1', '2', '3', '4', '5', '6'].map((grade) => (
                  <button key={grade} type="button" className="nav-link">
                    Grades {grade}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-footer-button"
            onClick={() => setIsProfileOpen(true)}
          >
            <FiUser aria-hidden="true" />
            <span>
              {profile
                ? `${profile.firstName} ${profile.lastName}`
                : `User #${userId ?? '—'}`}
            </span>
          </button>
          <button type="button" className="sidebar-footer-button" onClick={onLogout}>
            <FiLogOut aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <Profile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  )
}

export const TeacherSidebar = ({ userId, onLogout }: SidebarProps) => {
  const { profile } = useUser()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <>
      <aside className="dashboard-sidebar teacher-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-role">Teacher</div>
          <div className="sidebar-class">Grade 1 - Class 1A</div>
          <nav className="nav-links">
            <Year />
            <button type="button" className="nav-link">
              Scores
            </button>
            {['Term 1', 'Term 2', 'Term 3'].map((term) => (
              <button key={term} type="button" className="nav-link">
                {term}
              </button>
            ))}
          </nav>
        </div>
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-footer-button"
            onClick={() => setIsProfileOpen(true)}
          >
            <FiUser aria-hidden="true" />
            <span>{profile ? `${profile.firstName} ${profile.lastName}` : `User #${userId ?? '—'}`}</span>
          </button>
          <button type="button" className="sidebar-footer-button" onClick={onLogout}>
            <FiLogOut aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <Profile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  )
}
