import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../utils/api'
import './UpdateStudent.css'

type StudentResponse = {
  message: string
  data: {
    student_id: number
    student_number: string
    first_name: string
    last_name: string
    class_id: number
    created_at: string
    is_active: number
  }
}

const UpdateStudent = () => {
  const navigate = useNavigate()
  const { param } = useParams<{ param: string }>()
  const isAddMode = param === 'add'
  const studentId = useMemo(
    () => (param && !isAddMode ? Number(param) : null),
    [param, isAddMode],
  )

  const [studentNumber, setStudentNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [classId, setClassId] = useState('')
  const [status, setStatus] = useState('1')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadStudent = async () => {
      if (isAddMode) {
        setLoading(false)
        return
      }
      if (!studentId) {
        setError('Invalid student id.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<StudentResponse>(`/students/${studentId}`)
        const data = response.data?.data
        if (isActive && data) {
          setStudentNumber(String(data.student_number))
          setFirstName(String(data.first_name))
          setLastName(String(data.last_name))
          setClassId(String(data.class_id))
          setStatus(data.is_active === 1 ? '1' : '0')
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to load student details.'
        if (isActive) {
          setError(message)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadStudent()

    return () => {
      isActive = false
    }
  }, [isAddMode, studentId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!studentNumber || !firstName || !lastName || !classId) {
      setError('Student number, name, and class id are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        student_number: studentNumber,
        first_name: firstName,
        last_name: lastName,
        class_id: Number(classId),
        is_active: Number(status) === 1,
      }
      if (isAddMode) {
        await api.post('/students', payload)
      } else if (studentId) {
        await api.put(`/students/${studentId}`, payload)
      }
      navigate(-1)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to save student.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="updatestudent-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="updatestudent-backdrop"
        onClick={() => navigate(-1)}
        aria-label="Close student editor"
      />
      <form className="updatestudent-card" onSubmit={handleSubmit}>
        <h1 className="updatestudent-title">Student</h1>
        {error && <p className="updatestudent-error">{error}</p>}
        <label className="updatestudent-field">
          <span>Student Number</span>
          <input
            type="text"
            value={studentNumber}
            onChange={(event) => setStudentNumber(event.target.value)}
            placeholder="S-3A-01"
            disabled={loading || saving}
            required
          />
        </label>
        <label className="updatestudent-field">
          <span>First Name</span>
          <input
            type="text"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            disabled={loading || saving}
            required
          />
        </label>
        <label className="updatestudent-field">
          <span>Last Name</span>
          <input
            type="text"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            disabled={loading || saving}
            required
          />
        </label>
        <label className="updatestudent-field">
          <span>Class ID</span>
          <input
            type="number"
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            disabled={loading || saving}
            placeholder="7"
            required
          />
        </label>
        <label className="updatestudent-field">
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
        <div className="updatestudent-actions">
          <button
            type="button"
            className="updatestudent-button ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="updatestudent-button primary"
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : isAddMode ? 'Add' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UpdateStudent
