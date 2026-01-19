import { useEffect, useId, useState } from 'react'
import {
  FiBookOpen,
  FiCalendar,
  FiFileText,
  FiLayers,
  FiLogOut,
  FiMenu,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { Profile } from './sidebar/Profile'
import { useUser } from '../context/UserContext'
import './Sidebar.css'
import { Year } from './sidebar/Year'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

type SidebarProps = {
  userId: number | null
  onLogout: () => void
}

export const AdminSidebar = ({ userId, onLogout }: SidebarProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { profile } = useUser()
  const sidebarId = useId()
  const navigate = useNavigate()

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
          <div className="sidebar-role" onClick={() => navigate('/')}>Administrator</div>
            <Year />
          <nav className="nav-links">
            <div className="nav-group">
            <span className="nav-title">Manage</span>
              <div className="nav-sub">
                 <button type="button" className="nav-link" onClick={() => navigate('/manage-year')}>
                  <FiCalendar aria-hidden="true" />
                  Academic Year
                </button>
                <button type="button" className="nav-link" onClick={() => navigate('/staff')}>
                  <FiUsers aria-hidden="true" />
                  Staff Users
                </button>
                <button type="button" className="nav-link" onClick={() => navigate('/students')}>
                  <FiUserCheck aria-hidden="true" />
                  Students
                </button>
                <button type="button" className="nav-link" onClick={() => navigate('/studentreports')}>
                  <FiFileText aria-hidden="true" />
                  Student Report
                </button>                
                <button type="button" className="nav-link" onClick={() => navigate('/subjectreport')}>
                  <FiBookOpen aria-hidden="true" />
                  Subject Report
                </button>
              </div>
            </div>            
            <div className="nav-group">
              <span className="nav-title">Grades</span>
              <div className="nav-sub">
                {['1', '2', '3', '4', '5', '6'].map((grade) => (
                  <button key={grade} type="button" className="nav-link" onClick={() => navigate(`/grade/${grade}`)}>
                    <FiLayers aria-hidden="true" />
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const sidebarId = useId()
  const navigate = useNavigate()
  const [classroomLabel, setClassroomLabel] = useState('Classroom loading...')

  useEffect(() => {
    let isActive = true

    const loadClassroom = async () => {
      if (!profile?.userId) {
        setClassroomLabel('Classroom unavailable')
        return
      }
      try {
        const response = await api.get(`/classrooms/teacher/${profile.userId}`)
        const classroom = response.data?.data
        if (isActive && classroom) {
          setClassroomLabel(`Grade ${classroom.grade_number} - Class ${classroom.class_name}`)
        }
      } catch (err) {
        if (isActive) {
          setClassroomLabel('Classroom unavailable')
        }
      }
    }

    loadClassroom()

    return () => {
      isActive = false
    }
  }, [profile?.userId])

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
          <div className="sidebar-role" onClick={() => navigate('/')}>Teacher</div>
          <div className="sidebar-class">{classroomLabel}</div>
          <nav className="nav-links">
            <Year />
            <br />
            <span className="nav-title">Grades</span>
            {['Term 1', 'Term 2', 'Term 3'].map((term) => (
              <button key={term} type="button" className="nav-link" onClick={() => navigate(`/term/${term.split(' ')[1]}`)}>
                <FiFileText aria-hidden="true" />
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
