import { useEffect, useMemo, useState } from 'react'
import { CompactTable } from '@table-library/react-table-library/compact'
import { useTheme } from '@table-library/react-table-library/theme'
import { getTheme } from '@table-library/react-table-library/baseline'
import { FiEdit2, FiPlus } from 'react-icons/fi'
import { AdminSidebar } from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

type AcademicYear = {
  academic_year_id: number
  year_label: number
  start_date: string
  end_date: string
  is_active: number
}

type YearsResponse = {
  message: string
  data: AcademicYear[]
}

type YearRow = AcademicYear & {
  id: string
  active_label: string
}

const ManageYear = () => {
  const { userId, logout } = useAuth()
  const [years, setYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadYears = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<YearsResponse>('/years')
        if (isActive) {
          setYears(response.data?.data ?? [])
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load academic years.'
        if (isActive) {
          setError(message)
          setYears([])
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadYears()

    return () => {
      isActive = false
    }
  }, [])

  const data = useMemo(() => {
    const nodes: YearRow[] = years.map((year) => ({
      ...year,
      id: year.academic_year_id.toString(),
      active_label: year.is_active === 1 ? 'True' : 'False',
    }))
    return { nodes }
  }, [years])

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --table-library-grid-template-columns: 0.7fr 1fr 1fr 0.7fr;
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
    { label: 'Id', renderCell: (item: YearRow) => item.academic_year_id },
    { label: 'Year', renderCell: (item: YearRow) => item.year_label },
    { label: 'Active', renderCell: (item: YearRow) => item.active_label },
    {
      label: 'Action',
      renderCell: (item: YearRow) => (
        <button
          type="button"
          className="manageyear-action-button edit"
          aria-label={`Edit ${item.year_label}`}
        >
          <FiEdit2 aria-hidden="true" />
        </button>
      ),
      cellProps: { className: 'manageyear-action-cell' },
    },
  ]

  return (
    <main className="dashboard-layout">
      <AdminSidebar userId={userId} onLogout={logout} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="manageyear-header">
            <h1 className="manageyear-title">Classroom</h1>
            <FiPlus className="manageyear-title-icon" aria-hidden="true" />
          </div>
        </header>
        <section className="dashboard-content">
          <div className="manageyear-table-card">
            {(loading || error) && (
              <p className={`manageyear-status ${error ? 'error' : ''}`}>
                {loading ? 'Loading academic years...' : error}
              </p>
            )}
            <CompactTable columns={COLUMNS} data={data} theme={theme} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default ManageYear
