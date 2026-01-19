import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../utils/api'
import './UpdateStaff.css'

type UserResponse = {
  message: string
  data: {
    user_id: number
    staff_id: string
    password_hash: string
    first_name: string
    last_name: string
    role_id: number
    assigned_class_id: number | null
    created_at: string
    is_active: number
  }
}

type ClassroomResponse = {
  message: string
  data: Array<{
    class_id: number
    class_name: string
    grade_number: number
  }>
}

const UpdateStaff = () => {
  const navigate = useNavigate()
  const { param } = useParams<{ param: string }>()
  const isAddMode = param === 'add'
  const userId = useMemo(() => (param && !isAddMode ? Number(param) : null), [param, isAddMode])

  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [roleId, setRoleId] = useState('1')
  const [assignedClassId, setAssignedClassId] = useState('')
  const [status, setStatus] = useState('1')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classrooms, setClassrooms] = useState<ClassroomResponse['data']>([])
  const [classLoading, setClassLoading] = useState(true)
  const [classError, setClassError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadUser = async () => {
      if (isAddMode) {
        setLoading(false)
        return
      }
      if (!userId) {
        setError('Invalid user id.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<UserResponse>(`/users/${userId}`)
        const data = response.data?.data
        if (isActive && data) {
          setStaffId(String(data.staff_id))
          setFirstName(String(data.first_name))
          setLastName(String(data.last_name))
          setRoleId(String(data.role_id))
          setAssignedClassId(
            data.assigned_class_id != null ? String(data.assigned_class_id) : '',
          )
          setStatus(data.is_active === 1 ? '1' : '0')
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to load staff details.'
        if (isActive) {
          setError(message)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadUser()

    return () => {
      isActive = false
    }
  }, [isAddMode, userId])

  useEffect(() => {
    let isActive = true

    const loadClassrooms = async () => {
      setClassLoading(true)
      setClassError(null)
      try {
        const response = await api.get<ClassroomResponse>('/classrooms')
        const data = response.data?.data ?? []
        if (isActive) {
          setClassrooms(data)
        }
      } catch (err) {
        if (isActive) {
          setClassError('Unable to load classes.')
          setClassrooms([])
        }
      } finally {
        if (isActive) {
          setClassLoading(false)
        }
      }
    }

    void loadClassrooms()

    return () => {
      isActive = false
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!staffId || !firstName || !lastName || !roleId) {
      setError('Staff ID, first name, last name, and role are required.')
      return
    }
    if (isAddMode && !password) {
      setError('Password is required for new staff.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, string | number | boolean | null> = {
        staff_id: staffId,
        first_name: firstName,
        last_name: lastName,
        role_id: Number(roleId),
        is_active: Number(status) === 1,
      }
      if (password) {
        payload.password = password
      }
      if (Number(roleId) === 2) {
        payload.assigned_class_id = assignedClassId ? Number(assignedClassId) : null
      } else {
        payload.assigned_class_id = null
      }

      if (isAddMode) {
        await api.post('/staff', payload)
      } else if (userId) {
        await api.put(`/users/${userId}`, payload)
      }
      navigate(-1)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to save staff member.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="updatestaff-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="updatestaff-backdrop"
        onClick={() => navigate(-1)}
        aria-label="Close staff editor"
      />
      <form className="updatestaff-card" onSubmit={handleSubmit}>
        <h1 className="updatestaff-title">Staff Member</h1>
        {error && <p className="updatestaff-error">{error}</p>}
        <label className="updatestaff-field">
          <span>Staff ID</span>
          <input
            type="text"
            value={staffId}
            onChange={(event) => setStaffId(event.target.value)}
            placeholder="A-0001"
            disabled={loading || saving}
            required
          />
        </label>
        <label className="updatestaff-field">
          <span>Password {isAddMode ? '' : '(optional)'}</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isAddMode ? 'Enter password' : 'Leave blank to keep'}
            disabled={loading || saving}
          />
        </label>
        <label className="updatestaff-field">
          <span>First Name</span>
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            disabled={loading || saving}
            required
          />
        </label>
        <label className="updatestaff-field">
          <span>Last Name</span>
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            disabled={loading || saving}
            required
          />
        </label>
        <label className="updatestaff-field">
          <span>Role</span>
          <select
            value={roleId}
            onChange={(event) => {
              const nextRole = event.target.value
              setRoleId(nextRole)
              if (Number(nextRole) !== 2) {
                setAssignedClassId('')
              }
            }}
            disabled={loading || saving}
          >
            <option value="1">Admin</option>
            <option value="2">Teacher</option>
          </select>
        </label>
        <label className="updatestaff-field">
          <span>Assigned Class</span>
          <select
            value={assignedClassId}
            onChange={(event) => setAssignedClassId(event.target.value)}
            disabled={loading || saving || Number(roleId) !== 2 || classLoading}
          >
            <option value="">
              {classLoading
                ? 'Loading classes...'
                : classError
                  ? 'Classes unavailable'
                  : 'Select a class'}
            </option>
            {classrooms.map((classroom) => (
              <option key={classroom.class_id} value={classroom.class_id}>
                {classroom.class_id} - {classroom.class_name}
              </option>
            ))}
          </select>
        </label>
        <label className="updatestaff-field">
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={loading || saving}
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </label>
        <div className="updatestaff-actions">
          <button
            type="button"
            className="updatestaff-button ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="updatestaff-button primary"
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : isAddMode ? 'Add' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UpdateStaff
