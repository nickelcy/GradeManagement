import { useEffect, useMemo, useState } from 'react'
import { CompactTable } from '@table-library/react-table-library/compact'
import { useTheme } from '@table-library/react-table-library/theme'
import { getTheme } from '@table-library/react-table-library/baseline'
import { FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi'
import { AdminSidebar } from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

type Student = {
  student_id: string
  student_number: string
  first_name: string
  last_name: string
  class_id: string
  created_at: string
  is_active: string
}

type Classroom = {
  class_id: number
  grade_id: number
  class_name: string
  grade_number: number
}

type StudentsResponse = {
  message: string
  data: Student[]
}

type ClassroomResponse = {
  message: string
  data: Classroom
}

type StudentRow = Student & {
  id: string
  grade_label: string
  class_label: string
}

const Students = () => {
  const { userId, logout } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [classrooms, setClassrooms] = useState<Record<string, Classroom>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    const loadStudents = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<StudentsResponse>('/students')
        const nextStudents = Array.isArray(response.data?.data) ? response.data.data : []
        const classIds = Array.from(
          new Set(nextStudents.map((student) => student.class_id).filter(Boolean)),
        )

        const classroomEntries = await Promise.all(
          classIds.map(async (classId) => {
            try {
              const classroomResponse = await api.get<ClassroomResponse>(
                `/classrooms/${classId}`,
              )
              if (!classroomResponse.data?.data) {
                return null
              }
              return [classId, classroomResponse.data.data] as const
            } catch {
              return null
            }
          }),
        )

        if (isActive) {
          const nextClassrooms = classroomEntries.reduce<Record<string, Classroom>>(
            (acc, entry) => {
              if (entry) {
                acc[entry[0]] = entry[1]
              }
              return acc
            },
            {},
          )
          setClassrooms(nextClassrooms)
          setStudents(nextStudents)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load students.'
        if (isActive) {
          setError(message)
          setStudents([])
          setClassrooms({})
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadStudents()

    return () => {
      isActive = false
    }
  }, [])

  const data = useMemo(() => {
    const nodes: StudentRow[] = students.map((student) => {
      const classroom = classrooms[student.class_id]
      return {
        ...student,
        id: student.student_id,
        grade_label: classroom ? String(classroom.grade_number) : '—',
        class_label: classroom ? classroom.class_name : '—',
      }
    })
    return { nodes }
  }, [students, classrooms])

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --table-library-grid-template-columns: 1.1fr 1.1fr 1.1fr 0.7fr 0.7fr 0.7fr;
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
    { label: 'Id', renderCell: (item: StudentRow) => item.student_number },
    { label: 'Firstname', renderCell: (item: StudentRow) => item.first_name },
    { label: 'Lastname', renderCell: (item: StudentRow) => item.last_name },
    { label: 'Grade', renderCell: (item: StudentRow) => item.grade_label },
    { label: 'Class', renderCell: (item: StudentRow) => item.class_label },
    {
      label: 'Action',
      renderCell: (item: StudentRow) => (
        <div className="students-action-buttons">
          <button
            type="button"
            className="students-action-button delete"
            aria-label={`Delete ${item.student_number}`}
          >
            <FiTrash2 aria-hidden="true" />
          </button>
          <button
            type="button"
            className="students-action-button edit"
            aria-label={`Edit ${item.student_number}`}
          >
            <FiEdit2 aria-hidden="true" />
          </button>
        </div>
      ),
      cellProps: { className: 'students-action-cell' },
    },
  ]

  return (
    <main className="dashboard-layout">
      <AdminSidebar userId={userId} onLogout={logout} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="students-header">
            <h1 className="students-title">Students</h1>
            <FiUserPlus className="students-title-icon" aria-hidden="true" />
          </div>
        </header>
        <section className="dashboard-content">
          <div className="students-table-card">
            {(loading || error) && (
              <p className={`students-status ${error ? 'error' : ''}`}>
                {loading ? 'Loading students...' : error}
              </p>
            )}
            <CompactTable<StudentRow> columns={COLUMNS} data={data} theme={theme} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default Students
