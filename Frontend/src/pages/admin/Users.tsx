import { useEffect, useMemo, useState } from 'react'
import { CompactTable } from '@table-library/react-table-library/compact'
import { useTheme } from '@table-library/react-table-library/theme'
import { getTheme } from '@table-library/react-table-library/baseline'
import { FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi'
import { AdminSidebar } from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

type User = {
  user_id: string
  staff_id: string
  password_hash: string
  first_name: string
  last_name: string
  role_id: string
  assigned_class_id: string | null
  created_at: string
  is_active: string
}

type UsersResponse = {
  message: string
  data: User[]
}

type UserRow = User & {
  id: string
  role_label: string
}

const roleLabels: Record<string, string> = {
  '1': 'Admin',
  '2': 'Teacher',
}

const Users = () => {
  const { userId, logout } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    const loadUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await api.get<UsersResponse>('/users')
        const nextUsers = Array.isArray(response.data?.data) ? response.data.data : []
        if (isActive) {
          setUsers(nextUsers)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load users.'
        if (isActive) {
          setError(message)
          setUsers([])
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      isActive = false
    }
  }, [])

  const data = useMemo(() => {
    const nodes: UserRow[] = users.map((user) => ({
      ...user,
      id: user.user_id,
      role_label: roleLabels[user.role_id] ?? `Role ${user.role_id}`,
    }))
    return { nodes }
  }, [users])

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --table-library-grid-template-columns: 1.1fr 1.1fr 1.1fr 0.9fr 0.7fr;
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
    { label: 'Id', renderCell: (item: UserRow) => item.user_id },
    { label: 'Staff Id', renderCell: (item: UserRow) => item.staff_id },
    { label: 'Firstname', renderCell: (item: UserRow) => item.first_name },
    { label: 'Lastname', renderCell: (item: UserRow) => item.last_name },
    { label: 'Role', renderCell: (item: UserRow) => item.role_label },
    {
      label: 'Action',
      renderCell: (item: UserRow) => (
        <div className="users-action-buttons">
          <button
            type="button"
            className="users-action-button delete"
            aria-label={`Delete ${item.staff_id}`}
          >
            <FiTrash2 aria-hidden="true" />
          </button>
          <button
            type="button"
            className="users-action-button edit"
            aria-label={`Edit ${item.staff_id}`}
          >
            <FiEdit2 aria-hidden="true" />
          </button>
        </div>
      ),
      cellProps: { className: 'users-action-cell' },
    },
  ]

  return (
    <main className="dashboard-layout">
      <AdminSidebar userId={userId} onLogout={logout} />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="users-header">
            <h1 className="users-title">Staff Users</h1>
            <FiUserPlus className="users-title-icon" aria-hidden="true" />
          </div>
        </header>
        <section className="dashboard-content">
          <div className="users-table-card">
            {(loading || error) && (
              <p className={`users-status ${error ? 'error' : ''}`}>
                {loading ? 'Loading users...' : error}
              </p>
            )}
            <CompactTable columns={COLUMNS} data={data} theme={theme} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default Users
