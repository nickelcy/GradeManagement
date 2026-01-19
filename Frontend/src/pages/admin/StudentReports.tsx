import { useMemo, useState } from 'react'
import { CompactTable } from '@table-library/react-table-library/compact'
import { useTheme } from '@table-library/react-table-library/theme'
import { getTheme } from '@table-library/react-table-library/baseline'
import { FiEdit2 } from 'react-icons/fi'
import { AdminSidebar } from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { useNavigate } from 'react-router-dom'

type Score = {
  subject_name: string
  score_value: number
}

type StudentReport = {
  student_id: number
  student_number: string
  first_name: string
  last_name: string
  scores: Score[]
  overall_average: number
}

type ReportResponse = {
  message: string
  data: StudentReport[]
}

type StudentRow = StudentReport & {
  id: string
  math_score: string
  english_score: string
  science_score: string
  history_score: string
  overall_label: string
}

const normalizeSubject = (value: string) => value.trim().toLowerCase()

const getScoreValue = (scores: Score[], subject: string) => {
  const target = normalizeSubject(subject)
  const score = scores.find((entry) => normalizeSubject(entry.subject_name) === target)
  if (score) {
    return score.score_value.toString()
  }
  if (target === 'mathematics') {
    const mathScore = scores.find((entry) => normalizeSubject(entry.subject_name) === 'math')
    return mathScore ? mathScore.score_value.toString() : '—'
  }
  return '—'
}

const formatOverall = (value: number) => {
  if (!Number.isFinite(value)) {
    return '—'
  }
  const rounded = Math.round(value * 10) / 10
  return `${rounded}%`
}

const StudentReports = () => {
  const { userId, logout } = useAuth()
  const [year, setYear] = useState('')
  const [term, setTerm] = useState('')
  const [grade, setGrade] = useState('')
  const [classId, setClassId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [reports, setReports] = useState<StudentReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!year || !term) {
      setError('Year and term are required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('year', year)
      params.set('term', term)
      if (grade) {
        params.set('grade', grade)
      }
      if (classId) {
        params.set('class', classId)
      }
      if (studentId) {
        params.set('student', studentId)
      }
      const response = await api.get<ReportResponse>(`/reports/student?${params}`)
      const nextReports = Array.isArray(response.data?.data) ? response.data.data : []
      setReports(nextReports)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate report.'
      setError(message)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const data = useMemo(() => {
    const nodes: StudentRow[] = reports.map((report) => ({
      ...report,
      id: report.student_id.toString(),
      math_score: getScoreValue(report.scores, 'Mathematics'),
      english_score: getScoreValue(report.scores, 'English'),
      science_score: getScoreValue(report.scores, 'Science'),
      history_score: getScoreValue(report.scores, 'History'),
      overall_label: formatOverall(report.overall_average),
    }))
    return { nodes }
  }, [reports])

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --table-library-grid-template-columns: 0.9fr 1.1fr 1.1fr 0.9fr 0.9fr 0.9fr 0.9fr 0.8fr 0.7fr;
        background: #2f2f2f;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.12);
      `,
      HeaderRow: `
        background: #3a3a3a;
      `,
      BaseRow: `
        font-size: 0.95rem;
      `,
      Row: `
        &:nth-of-type(odd) {
          background: #313131;
        }

        &:nth-of-type(even) {
          background: #2c2c2c;
        }

        &:not(:last-of-type) > .td {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
      `,
      HeaderCell: `
        font-size: 0.9rem;
        color: #f0f0f0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      `,
      BaseCell: `
        padding: 14px 16px;
        border-right: 1px solid rgba(255, 255, 255, 0.08);

        &:last-of-type {
          border-right: none;
        }
      `,
      Cell: `
        color: #e8e8e8;
      `,
    },
  ])

  const COLUMNS = [
    { label: 'Id', renderCell: (item: StudentRow) => item.student_id },
    { label: 'SID', renderCell: (item: StudentRow) => item.student_number },
    { label: 'Firstname', renderCell: (item: StudentRow) => item.first_name },
    { label: 'Lastname', renderCell: (item: StudentRow) => item.last_name },
    { label: 'Math', renderCell: (item: StudentRow) => item.math_score },
    { label: 'English', renderCell: (item: StudentRow) => item.english_score },
    { label: 'Science', renderCell: (item: StudentRow) => item.science_score },
    { label: 'History', renderCell: (item: StudentRow) => item.history_score },
    { label: 'Overall', renderCell: (item: StudentRow) => item.overall_label },
    {
      label: 'Action',
      renderCell: (item: StudentRow) => (
        <div className="reports-action-buttons">
          <button
            type="button"
            className="reports-action-button edit"
            aria-label={`Edit report for ${item.student_number}`}
            onClick={() => {
              if (!year || !term) {
                setError('Year and term are required to edit scores.')
                return
              }
              navigate(`/scores/${item.student_id}/${year}/${term}`)
            }}
          >
            <FiEdit2 aria-hidden="true" />
          </button>
        </div>
      ),
      cellProps: { className: 'reports-action-cell' },
    },
  ]

  return (
    <main className="dashboard-layout">
      <AdminSidebar userId={userId} onLogout={logout} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="reports-header">
            <h1 className="reports-title">Student Report</h1>
          </div>
        </header>
        <section className="dashboard-content">
          <form className="reports-controls" onSubmit={handleGenerate}>
            <label className="reports-field">
              <span>Year</span>
              <input
                className="reports-input"
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                placeholder="2026"
                required
              />
            </label>
            <label className="reports-field">
              <span>Grade No.</span>
              <input
                className="reports-input"
                type="number"
                min="1"
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
                placeholder="6"
              />
            </label>
            <label className="reports-field">
              <span>Term No.</span>
              <input
                className="reports-input"
                type="number"
                min="1"
                max="3"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="1"
                required
              />
            </label>
            <label className="reports-field">
              <span>Class Id</span>
              <input
                className="reports-input"
                type="number"
                min="1"
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                placeholder="31"
              />
            </label>
            <label className="reports-field">
              <span>Student Id</span>
              <input
                className="reports-input"
                type="number"
                min="1"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                placeholder="62"
              />
            </label>
            <button className="reports-button" type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </form>
          <div className="reports-table-card">
            {error && <p className="reports-status error">{error}</p>}
            <CompactTable columns={COLUMNS} data={data} theme={theme} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default StudentReports
