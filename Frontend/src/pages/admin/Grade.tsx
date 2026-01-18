import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CompactTable } from '@table-library/react-table-library/compact'
import { useTheme } from '@table-library/react-table-library/theme'
import { getTheme } from '@table-library/react-table-library/baseline'
import { FiEdit2, FiExternalLink, FiPlusCircle, FiTrash2 } from 'react-icons/fi'
import { AdminSidebar } from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import { useYear } from '../../context/YearContext'
import api from '../../utils/api'

type Classroom = {
  class_id: number
  grade_id: number
  class_name: string
  grade_number: number
  student_count: number
}

type ClassroomsResponse = {
  message: string
  data: Classroom[]
}

type ClassroomRow = Classroom & {
  id: string
  students_label: string
}

const Grade = () => {
  const { userId, logout } = useAuth()
  const { years, selectedYearId } = useYear()
  const { grade } = useParams<{ grade: string }>()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
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
    const loadClassrooms = async () => {
      if (!grade) {
        setError('Grade is missing from the route.')
        setClassrooms([])
        setLoading(false)
        return
      }
      if (!selectedYearLabel) {
        setError('Select an academic year to load classrooms.')
        setClassrooms([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('year', selectedYearLabel)
        params.set('grade', grade)
        const response = await api.get<ClassroomsResponse>(
          `/classrooms/year-grade?${params}`,
        )
        const nextClassrooms = Array.isArray(response.data?.data) ? response.data.data : []
        if (isActive) {
          setClassrooms(nextClassrooms)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load classrooms.'
        if (isActive) {
          setError(message)
          setClassrooms([])
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadClassrooms()

    return () => {
      isActive = false
    }
  }, [grade, selectedYearLabel])

  const data = useMemo(() => {
    const nodes: ClassroomRow[] = classrooms.map((room) => ({
      ...room,
      id: room.class_id.toString(),
      students_label: Number.isFinite(room.student_count)
        ? room.student_count.toString()
        : '—',
    }))
    return { nodes }
  }, [classrooms])

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --table-library-grid-template-columns: 1.1fr 0.7fr 0.8fr 0.8fr;
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
    { label: 'Id', renderCell: (item: ClassroomRow) => item.class_id },
    { label: 'Name', renderCell: (item: ClassroomRow) => item.class_name },
    { label: 'Grade', renderCell: (item: ClassroomRow) => item.grade_number },
    { label: 'Students', renderCell: (item: ClassroomRow) => item.students_label },
    {
      label: 'Action',
      renderCell: (item: ClassroomRow) => (
        <div className="grade-action-buttons">
          <button
            type="button"
            className="grade-action-button view"
            aria-label={`View ${item.class_name}`}
          >
            <FiExternalLink aria-hidden="true" />
          </button>
        </div>
      ),
      cellProps: { className: 'grade-action-cell' },
    },
  ]

  return (
    <main className="dashboard-layout">
      <AdminSidebar userId={userId} onLogout={logout} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="grade-header">
            <h1 className="grade-title">Classroom</h1>
            <FiPlusCircle className="grade-title-icon" aria-hidden="true" />
          </div>
        </header>
        <section className="dashboard-content">
          <div className="grade-table-card">
            {(loading || error) && (
              <p className={`grade-status ${error ? 'error' : ''}`}>
                {loading ? 'Loading classrooms...' : error}
              </p>
            )}
            <CompactTable columns={COLUMNS} data={data} theme={theme} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default Grade
