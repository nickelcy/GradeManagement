import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CompactTable } from '@table-library/react-table-library/compact'
import { useTheme } from '@table-library/react-table-library/theme'
import { getTheme } from '@table-library/react-table-library/baseline'
import { FiEdit2 } from 'react-icons/fi'
import { AdminSidebar } from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import { useYear } from '../../context/YearContext'
import api from '../../utils/api'

type ScoresResponse = {
  message: string
  student_id: number
  year: number
  overall: number
  subjects: { subject_id: number; name: string }[]
  terms: {
    term_id: number
    term_number: number
    overall: number
    scores: Record<string, { score_id: number | null; value: number | null }>
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

type TermRow = {
  id: string
  term_number: number
  overall_label: string
  scores: Record<string, number | null>
}

const formatOverall = (value: number | null) => {
  if (!Number.isFinite(value ?? NaN)) {
    return '—'
  }
  const rounded = Math.round((value ?? 0) * 10) / 10
  return `${rounded}%`
}

const Scores = () => {
  const { userId, logout } = useAuth()
  const { selectedYearId, years } = useYear()
  const { studentid } = useParams<{ studentid: string }>()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<{ subject_id: number; name: string }[]>([])
  const [terms, setTerms] = useState<ScoresResponse['terms']>([])
  const [student, setStudent] = useState<StudentResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedYearLabel = useMemo(() => {
    const selected = years.find(
      (year) => String(year.academic_year_id) === selectedYearId,
    )
    return selected ? String(selected.year_label) : ''
  }, [years, selectedYearId])

  useEffect(() => {
    let isActive = true

    const loadScores = async () => {
      if (!studentid) {
        setError('Missing student id.')
        setLoading(false)
        return
      }
      if (!selectedYearLabel) {
        setError('Select an academic year to load scores.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('student', studentid)
        params.set('year', selectedYearLabel)
        const [scoresResponse, studentResponse] = await Promise.all([
          api.get<ScoresResponse>(`/students/scores?${params}`),
          api.get<StudentResponse>(`/students/${studentid}`),
        ])

        if (isActive) {
          setSubjects(scoresResponse.data?.subjects ?? [])
          setTerms(scoresResponse.data?.terms ?? [])
          setStudent(studentResponse.data?.data ?? null)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load scores.'
        if (isActive) {
          setError(message)
          setSubjects([])
          setTerms([])
          setStudent(null)
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
  }, [selectedYearLabel, studentid])

  const data = useMemo(() => {
    const nodes: TermRow[] = terms.map((term) => {
      const scoreValues: Record<string, number | null> = {}
      subjects.forEach((subject) => {
        scoreValues[subject.name] =
          term.scores?.[String(subject.subject_id)]?.value ?? null
      })
      return {
        id: term.term_id.toString(),
        term_number: term.term_number,
        overall_label: formatOverall(term.overall),
        scores: scoreValues,
      }
    })
    return { nodes }
  }, [subjects, terms])

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --table-library-grid-template-columns: 0.7fr ${subjects
          .map(() => '0.9fr')
          .join(' ')} 0.8fr;
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

  const subjectColumns = subjects.map((subject) => ({
    label: subject.name,
    renderCell: (item: TermRow) => item.scores[subject.name] ?? '—',
  }))

  const COLUMNS = [
    { label: 'Term', renderCell: (item: TermRow) => item.term_number },
    ...subjectColumns,
    { label: 'Overall', renderCell: (item: TermRow) => item.overall_label },
    {
      label: 'Action',
      renderCell: (item: TermRow) => (
        <button
          type="button"
          className="scores-action-button edit"
          aria-label={`Edit term ${item.term_number}`}
          onClick={() => {navigate(`/scores/${studentid}/${selectedYearLabel}/${item.term_number}`)}}
        >
          <FiEdit2 aria-hidden="true" />
        </button>
      ),
      cellProps: { className: 'scores-action-cell' },
    },
  ]

  const headerTitle = `Academic Performance ${selectedYearLabel || ''}`.trim()
  const studentLabel = student
    ? `Id#${student.student_id} - ${student.first_name} ${student.last_name} (${student.student_number})`
    : 'Student'

  return (
    <main className="dashboard-layout">
      <AdminSidebar userId={userId} onLogout={logout} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="scores-header">
            <h1 className="scores-title">{headerTitle}</h1>
            <p className="scores-subtitle">{studentLabel}</p>
          </div>
        </header>
        <section className="dashboard-content">
          <button
            type="button"
            className="scores-back"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <div className="scores-table-card">
            {(loading || error) && (
              <p className={`scores-status ${error ? 'error' : ''}`}>
                {loading ? 'Loading scores...' : error}
              </p>
            )}
            <CompactTable columns={COLUMNS} data={data} theme={theme} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default Scores
