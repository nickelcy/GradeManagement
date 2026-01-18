import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CompactTable } from '@table-library/react-table-library/compact'
import { useTheme } from '@table-library/react-table-library/theme'
import { getTheme } from '@table-library/react-table-library/baseline'
import { FiBarChart2, FiEdit2, FiUserPlus } from 'react-icons/fi'
import { AdminSidebar } from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

type Student = {
  student_id: number
  student_number: string
  first_name: string
  last_name: string
  class_id: number
  created_at: string
  is_active: number
}

type StudentsResponse = {
  message: string
  data: Student[]
}

type ClassroomResponse = {
  message: string
  data: {
    class_id: number
    grade_id: number
    class_name: string
    grade_number: number
  }
}

type StudentRow = Student & {
  id: string
  grade_label: string
  class_label: string
}

const ClassList = () => {
  const { userId, logout } = useAuth()
  const navigate = useNavigate()
  const { classid } = useParams<{ classid: string }>()
  const [students, setStudents] = useState<Student[]>([])
  const [classroom, setClassroom] = useState<ClassroomResponse['data'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadClassData = async () => {
      if (!classid) {
        setError('Missing class id.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set('class', classid)
        const [studentsResponse, classroomResponse] = await Promise.all([
          api.get<StudentsResponse>(`/classrooms/students?${params}`),
          api.get<ClassroomResponse>(`/classrooms/${classid}`),
        ])

        if (isActive) {
          setStudents(studentsResponse.data?.data ?? [])
          setClassroom(classroomResponse.data?.data ?? null)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load class students.'
        if (isActive) {
          setError(message)
          setStudents([])
          setClassroom(null)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadClassData()

    return () => {
      isActive = false
    }
  }, [classid])

  const data = useMemo(() => {
    const gradeLabel = classroom ? String(classroom.grade_number) : '—'
    const classLabel = classroom ? classroom.class_name : '—'
    const nodes: StudentRow[] = students.map((student) => ({
      ...student,
      id: student.student_id.toString(),
      grade_label: gradeLabel,
      class_label: classLabel,
    }))
    return { nodes }
  }, [students, classroom])

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --table-library-grid-template-columns: 0.9fr 1fr 1.1fr 1.1fr 0.7fr 0.7fr 0.9fr;
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
    { label: 'Student ID', renderCell: (item: StudentRow) => item.student_id },
    { label: 'Student No.', renderCell: (item: StudentRow) => item.student_number },
    { label: 'Firstname', renderCell: (item: StudentRow) => item.first_name },
    { label: 'Lastname', renderCell: (item: StudentRow) => item.last_name },
    { label: 'Grade', renderCell: (item: StudentRow) => item.grade_label },
    { label: 'Class', renderCell: (item: StudentRow) => item.class_label },
    {
      label: 'Action',
      renderCell: (item: StudentRow) => (
        <div className="classlist-action-buttons">
          <button
            type="button"
            className="classlist-action-button edit"
            aria-label={`Edit ${item.student_number}`}
            onClick={() => {navigate(`/manage-student/${item.student_id}`)}}
          >
            <FiEdit2 aria-hidden="true" />
          </button>
          <button
            type="button"
            className="classlist-action-button info"
            aria-label={`View ${item.student_number}`}
            onClick={() => {navigate(`/scores/${item.student_id}`)}}
          >
            <FiBarChart2 aria-hidden="true" />
          </button>
        </div>
      ),
      cellProps: { className: 'classlist-action-cell' },
    },
  ]

  const headerTitle = classroom
    ? `#${classroom.class_id} Grade ${classroom.grade_number} - ${classroom.class_name}`
    : 'Classroom'

  return (
    <main className="dashboard-layout">
      <AdminSidebar userId={userId} onLogout={logout} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="classlist-header">
            <h1 className="classlist-title">{headerTitle}</h1>
            <FiUserPlus className="classlist-title-icon" aria-hidden="true" onClick={() => {navigate(`/manage-student/add`)}} />
          </div>
        </header>
        <section className="dashboard-content">
          <button
            type="button"
            className="classlist-back"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <div className="classlist-table-card">
            {(loading || error) && (
              <p className={`classlist-status ${error ? 'error' : ''}`}>
                {loading ? 'Loading students...' : error}
              </p>
            )}
            <CompactTable columns={COLUMNS} data={data} theme={theme} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default ClassList
