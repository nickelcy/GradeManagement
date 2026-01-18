import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CompactTable } from '@table-library/react-table-library/compact'
import { useTheme } from '@table-library/react-table-library/theme'
import { getTheme } from '@table-library/react-table-library/baseline'
import { FiEdit2 } from 'react-icons/fi'
import { TeacherSidebar } from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import { useUser } from '../../context/UserContext'
import { useYear } from '../../context/YearContext'
import api from '../../utils/api'

type ClassResponse = {
  message: string
  data: {
    class_id: number
    grade_id: number
    class_name: string
    grade_number: number
    student_count: number
  }
}

type ClassScoresResponse = {
  message: string
  term: {
    term_id: number
    term_number: number
    year: number
  }
  subjects: string[]
  students: StudentScore[]
}

type StudentScore = {
  student_id: number
  student_number: string
  name: string
  scores: Record<string, number>
  overall: number
}

type StudentRow = StudentScore & {
  id: string
  first_name: string
  last_name: string
  overall_label: string
}

const splitName = (name: string) => {
  const [first, ...rest] = name.trim().split(' ')
  return {
    firstName: first ?? '',
    lastName: rest.join(' '),
  }
}

const formatOverall = (value: number) => {
  if (!Number.isFinite(value)) {
    return '—'
  }
  const rounded = Math.round(value * 10) / 10
  return `${rounded}%`
}

const Term = () => {
  const { userId, logout } = useAuth()
  const { profile } = useUser()
  const { years, selectedYearId } = useYear()
  const { term } = useParams<{ term: string }>()
  const [subjects, setSubjects] = useState<string[]>([])
  const [students, setStudents] = useState<StudentScore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedYear = useMemo(
    () => years.find((year) => String(year.academic_year_id) === selectedYearId),
    [years, selectedYearId],
  )
  const selectedYearLabel = selectedYear ? String(selectedYear.year_label) : ''
  const isActiveYear = selectedYear?.is_active === 1
  const isEditable = Boolean(selectedYearLabel && isActiveYear)

  useEffect(() => {
    let isActive = true

    const loadScores = async () => {
      if (!profile?.userId) {
        setError('Teacher profile not available.')
        setLoading(false)
        return
      }
      if (!term) {
        setError('Missing term parameter.')
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
        const classResponse = await api.get<ClassResponse>(
          `/classrooms/teacher/${profile.userId}`,
        )
        const classId = classResponse.data?.data?.class_id
        if (!classId) {
          throw new Error('Assigned classroom not found.')
        }

        const params = new URLSearchParams()
        params.set('class', String(classId))
        params.set('year', selectedYearLabel)
        params.set('term', term)
        const scoresResponse = await api.get<ClassScoresResponse>(
          `/classes/scores?${params}`,
        )

        if (isActive) {
          setSubjects(scoresResponse.data?.subjects ?? [])
          setStudents(scoresResponse.data?.students ?? [])
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load class scores.'
        if (isActive) {
          setError(message)
          setSubjects([])
          setStudents([])
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
  }, [profile?.userId, selectedYearLabel, term])

  const data = useMemo(() => {
    const nodes: StudentRow[] = students.map((student) => {
      const { firstName, lastName } = splitName(student.name)
      return {
        ...student,
        id: student.student_id.toString(),
        first_name: firstName,
        last_name: lastName,
        overall_label: formatOverall(student.overall),
      }
    })
    return { nodes }
  }, [students])

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --table-library-grid-template-columns: 1fr 1.1fr 1.1fr ${subjects
          .map(() => '0.9fr')
          .join(' ')} 0.8fr 0.7fr;
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
    label: subject,
    renderCell: (item: StudentRow) => item.scores?.[subject] ?? '—',
  }))

  const COLUMNS = [
    { label: 'Student No.', renderCell: (item: StudentRow) => item.student_number },
    { label: 'Firstname', renderCell: (item: StudentRow) => item.first_name },
    { label: 'Lastname', renderCell: (item: StudentRow) => item.last_name },
    ...subjectColumns,
    { label: 'Overall', renderCell: (item: StudentRow) => item.overall_label },
    {
      label: 'Action',
      renderCell: (item: StudentRow) => (
        <div className="term-action-buttons">
          <button
            type="button"
            disabled={!isEditable}
            className={`term-action-button edit ${isEditable ? '' : 'muted'}`}
            aria-label={`Edit ${item.student_number}`}
          >
            <FiEdit2 aria-hidden="true" />
          </button>
        </div>
      ),
      cellProps: { className: 'term-action-cell' },
    }
  ]

  return (
    <main className="dashboard-layout">
      <TeacherSidebar userId={userId} onLogout={logout} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="term-header">
            <h1 className="term-title">Score Management</h1>
            <p className="term-meta">
              TERM #{term ?? '—'} ({selectedYearLabel || '—'}) -{' '}
              <i>{isEditable ? 'Editable' : 'View Only'}</i>
            </p>
          </div>
        </header>
        <section className="dashboard-content">
          <div className="term-table-card">
            {(loading || error) && (
              <p className={`term-status ${error ? 'error' : ''}`}>
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

export default Term
