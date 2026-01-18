import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import './ScoreEdit.css'

type ScoreResponse = {
  message: string
  student_id: number
  year: number
  overall: number
  subjects: { subject_id: number; name: string }[]
  terms: {
    term_id: number
    term_number: number
    overall: number
    scores: Record<string, { score_id: number | null; value: number }>
  }[]
}

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

type SubjectScore = {
  subjectId: number
  name: string
  value: number
}

const ScoreEdit = () => {
  const navigate = useNavigate()
  const { student, year, term } = useParams<{
    student: string
    year: string
    term: string
  }>()
  const [subjects, setSubjects] = useState<SubjectScore[]>([])
  const [studentName, setStudentName] = useState('Student')
  const [studentNumber, setStudentNumber] = useState('')
  const [overall, setOverall] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const termNumber = useMemo(() => Number(term ?? 0), [term])
  const yearNumber = useMemo(() => Number(year ?? 0), [year])
//   const studentId = useMemo(() => Number(student ?? 0), [student])

  useEffect(() => {
    let isActive = true

    const loadScores = async () => {
      if (!student || !year || !term) {
        setError('Missing student, year, or term.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('student', student)
        params.set('year', year)
        params.set('term', term)
        const [scoreResponse, studentResponse] = await Promise.all([
          api.get<ScoreResponse>(`/students/scores?${params}`),
          api.get<StudentResponse>(`/students/${student}`),
        ])
        const payload = scoreResponse.data
        const studentInfo = studentResponse.data?.data
        const targetTerm =
          payload.terms.find((entry) => entry.term_number === Number(term)) ??
          payload.terms[0]
        const nextSubjects = payload.subjects.map((subject) => {
          const value =
            targetTerm?.scores?.[String(subject.subject_id)]?.value ?? 0
          return {
            subjectId: subject.subject_id,
            name: subject.name,
            value,
          }
        })

        if (isActive) {
          setSubjects(nextSubjects)
          setOverall(targetTerm?.overall ?? payload.overall ?? null)
          setStudentNumber(
            studentInfo?.student_number
              ? String(studentInfo.student_number)
              : String(payload.student_id),
          )
          setStudentName(
            studentInfo
              ? `${studentInfo.first_name} ${studentInfo.last_name}`
              : `Student ${payload.student_id}`,
          )
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to load scores.'
        if (isActive) {
          setError(message)
          setSubjects([])
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadScores()

    return () => {
      isActive = false
    }
  }, [student, term, year])

  const handleChange = (subjectId: number, value: string) => {
    const numericValue = Number(value)
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.subjectId === subjectId
          ? { ...subject, value: Number.isFinite(numericValue) ? numericValue : 0 }
          : subject,
      ),
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!student || !year || !term) {
      setError('Missing student, year, or term.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const body = {
        scores: subjects.map((subject) => ({
          [subject.name]: subject.value,
        })),
      }
      const params = new URLSearchParams()
      params.set('student', student)
      params.set('year', year)
      params.set('term', term)
      await api.put(`/students/scores?${params}`, body)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to update scores.'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="score-edit-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="score-edit-backdrop"
        onClick={() => navigate(-1)}
        aria-label="Close score editor"
      />
      <form className="score-edit-card" onSubmit={handleSubmit}>
        <h1 className="score-edit-title">{studentName}</h1>
        {error && <p className="score-edit-error">{error}</p>}
        <div className="score-edit-summary">
          <label className="score-edit-field">
            <span>Student No.</span>
            <input type="text" value={studentNumber} readOnly />
          </label>
          <label className="score-edit-field">
            <span>Year</span>
            <input type="text" value={yearNumber || ''} readOnly />
          </label>
          <label className="score-edit-field">
            <span>Term</span>
            <input type="text" value={termNumber || ''} readOnly />
          </label>
        </div>
        <div className="score-edit-grid">
          {subjects.map((subject) => (
            <label key={subject.subjectId} className="score-edit-field">
              <span>{subject.name}</span>
              <input
                type="number"
                value={subject.value}
                onChange={(event) => handleChange(subject.subjectId, event.target.value)}
                min="0"
                max="100"
                disabled={loading || saving}
              />
            </label>
          ))}
          <label className="score-edit-field full">
            <span>Overall</span>
            <input type="text" value={`%${overall ?? '0'}`} readOnly />
          </label>
        </div>
        <div className="score-edit-actions">
          <button
            type="button"
            className="score-edit-button ghost"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            type="submit"
            className="score-edit-button primary"
            disabled={loading || saving}
          >
            {saving ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ScoreEdit
