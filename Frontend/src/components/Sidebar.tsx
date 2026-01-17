import { useId, useState } from 'react'
import { FiLogOut, FiMenu, FiUser, FiX } from 'react-icons/fi'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { profile } = useUser()
  const sidebarId = useId()

  return (
    <>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        aria-expanded={isSidebarOpen}
        aria-controls={sidebarId}
      >
        {isSidebarOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        <span>{isSidebarOpen ? 'Close menu' : 'Open menu'}</span>
      </button>
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          role="presentation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside
        id={sidebarId}
        className={`dashboard-sidebar admin-sidebar ${isSidebarOpen ? 'open' : ''}`}
      >
        <div className="sidebar-top">
          <div className="sidebar-role">Administrator</div>
            <Year />
          <nav className="nav-links">
            <div className="nav-group">
            <span className="nav-title">Manage</span>
              <div className="nav-sub">
                <button type="button" className="nav-link">
                  Staff Users
                </button>
                <button type="button" className="nav-link">
                  Students
                </button>
                <button type="button" className="nav-link">
                  Reports
                </button>
              </div>
            </div>            
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const sidebarId = useId()

  return (
    <>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        aria-expanded={isSidebarOpen}
        aria-controls={sidebarId}
      >
        {isSidebarOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        <span>{isSidebarOpen ? 'Close menu' : 'Open menu'}</span>
      </button>
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop"
          role="presentation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside
        id={sidebarId}
        className={`dashboard-sidebar teacher-sidebar ${isSidebarOpen ? 'open' : ''}`}
      >
        <div className="sidebar-top">
          <div className="sidebar-role">Teacher</div>
          <div className="sidebar-class">Grade 1 - Class 1A</div>
          <nav className="nav-links">
            <Year />
            <br />
            <span className="nav-title">Grades</span>
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
            <span>
              {profile ? `${profile.firstName} ${profile.lastName}` : `User #${userId ?? '—'}`}
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
