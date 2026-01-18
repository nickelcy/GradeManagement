import { useMemo, useState } from 'react'
import { CompactTable } from '@table-library/react-table-library/compact'
import { useTheme } from '@table-library/react-table-library/theme'
import { getTheme } from '@table-library/react-table-library/baseline'
import { AdminSidebar } from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

type SubjectReportResponse = {
  message: string
  data: {
    subject_name: string
    average: number
    params: {
      year: string
      term: string
      grade: string
      subject: string
    }
  }
}

type SubjectRow = {
  id: string
  year: string
  grade: string
  subject: string
  average: string
}

const formatAverage = (value: number) => {
  if (!Number.isFinite(value)) {
    return '—'
  }
  const rounded = Math.round(value * 10) / 10
  return `${rounded}%`
}

const SubjectReport = () => {
  const { userId, logout } = useAuth()
  const [year, setYear] = useState('')
  const [term, setTerm] = useState('')
  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [report, setReport] = useState<SubjectReportResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!year || !term || !grade || !subject) {
      setError('Year, term, grade, and subject are required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('year', year)
      params.set('term', term)
      params.set('grade', grade)
      params.set('subject', subject)
      const response = await api.get<SubjectReportResponse>(`/reports/subject?${params}`)
      setReport(response.data?.data ?? null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate report.'
      setError(message)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  const data = useMemo(() => {
    if (!report) {
      return { nodes: [] as SubjectRow[] }
    }
    const params = report.params
    return {
      nodes: [
        {
          id: `${params.year}-${params.grade}-${params.subject}-${params.term}`,
          year: params.year,
          grade: `Grade ${params.grade}`,
          subject: report.subject_name,
          average: formatAverage(report.average),
        },
      ],
    }
  }, [report])

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --table-library-grid-template-columns: 1fr 1fr 1.2fr 1fr;
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
    { label: 'Year', renderCell: (item: SubjectRow) => item.year },
    { label: 'Grade', renderCell: (item: SubjectRow) => item.grade },
    { label: 'Subject', renderCell: (item: SubjectRow) => item.subject },
    { label: 'Average', renderCell: (item: SubjectRow) => item.average },
  ]

  return (
    <main className="dashboard-layout">
      <AdminSidebar userId={userId} onLogout={logout} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="reports-header">
            <h1 className="reports-title">Subject Report</h1>
          </div>
        </header>
        <section className="dashboard-content">
          <div className="subject-id-guide">
            <p className="subject-id-note">
              Subject IDs are grouped in blocks of 4 per grade:
            </p>
            <table className="subject-id-table">
              <thead>
                <tr>
                  <th scope="col">Grade</th>
                  <th scope="col">Subject IDs</th>
                  <th scope="col">Subjects</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>1-4</td>
                  <td>History, Science, English, Math</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>5-8</td>
                  <td>History, Science, English, Math</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>9-12</td>
                  <td>History, Science, English, Math</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>13-16</td>
                  <td>History, Science, English, Math</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>17-20</td>
                  <td>History, Science, English, Math</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>21-24</td>
                  <td>History, Science, English, Math</td>
                </tr>
              </tbody>
            </table>
          </div>
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
              <span>Grade</span>
              <input
                className="reports-input"
                type="number"
                min="1"
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
                placeholder="6"
                required
              />
            </label>
            <label className="reports-field">
              <span>Subject Id</span>
              <input
                className="reports-input"
                type="number"
                min="1"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="21"
                required
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

export default SubjectReport
