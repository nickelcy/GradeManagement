import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../utils/api'
import './UpdateYear.css'

type YearResponse = {
  message: string
  data: {
    academic_year_id: number
    year_label: number
    start_date: string
    end_date: string
    is_active: number
  }
}

const UpdateYear = () => {
  const navigate = useNavigate()
  const { param } = useParams<{ param: string }>()
  const isAddMode = param === 'add'
  const yearId = useMemo(() => (param && !isAddMode ? Number(param) : null), [param, isAddMode])

  const [label, setLabel] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('0')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadYear = async () => {
      if (isAddMode) {
        setLoading(false)
        return
      }
      if (!yearId) {
        setError('Invalid year id.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<YearResponse>(`/years/${yearId}`)
        const data = response.data?.data
        if (isActive && data) {
          setLabel(String(data.year_label))
          setStartDate(String(data.start_date))
          setEndDate(String(data.end_date))
          setStatus(data.is_active === 1 ? '1' : '0')
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to load academic year.'
        if (isActive) {
          setError(message)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadYear()

    return () => {
      isActive = false
    }
  }, [isAddMode, yearId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!label || !startDate || !endDate) {
      setError('All fields are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        year_label: Number(label),
        start_date: startDate,
        end_date: endDate,
        is_active: Number(status),
      }
      if (isAddMode) {
        await api.post('/years', payload)
      } else if (yearId) {
        await api.put(`/years/${yearId}`, payload)
      }
      navigate(-1)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to save academic year.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="updateyear-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="updateyear-backdrop"
        onClick={() => navigate(-1)}
        aria-label="Close academic year editor"
      />
      <form className="updateyear-card" onSubmit={handleSubmit}>
        <h1 className="updateyear-title">Academic Year</h1>
        {error && <p className="updateyear-error">{error}</p>}
        <label className="updateyear-field">
          <span>Label</span>
          <input
            type="number"
            min="2000"
            max="2100"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="2026"
            disabled={loading || saving}
            required
          />
        </label>
        <label className="updateyear-field">
          <span>Start Date</span>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            disabled={loading || saving}
            required
          />
        </label>
        <label className="updateyear-field">
          <span>End Date</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            disabled={loading || saving}
            required
          />
        </label>
        <label className="updateyear-field">
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
        <div className="updateyear-actions">
          <button
            type="button"
            className="updateyear-button ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="updateyear-button primary"
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : isAddMode ? 'Add' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UpdateYear
