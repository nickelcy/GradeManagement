import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

type UserProfile = {
  userId: number
  staffId: string
  firstName: string
  lastName: string
  roleId: number | null
  assignedClassId: number | null
  createdAt: string | null
  isActive: boolean
}

type UserContextValue = {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

type UserProviderProps = {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { userId, token } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId || !token) {
      setProfile(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/users/${userId}`)
      const data = response.data?.data ?? {}
      setProfile({
        userId: Number(data.user_id ?? userId ?? 0),
        staffId: String(data.staff_id ?? userId ?? ''),
        firstName: String(data.first_name ?? ''),
        lastName: String(data.last_name ?? ''),
        roleId: data.role_id != null ? Number(data.role_id) : null,
        assignedClassId:
          data.assigned_class_id != null ? Number(data.assigned_class_id) : null,
        createdAt: data.created_at ? String(data.created_at) : null,
        isActive: Boolean(data.is_active),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load profile.'
      setError(message)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [token, userId])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const value = useMemo(
    () => ({
      profile,
      loading,
      error,
      refresh: fetchProfile,
    }),
    [profile, loading, error, fetchProfile],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider.')
  }
  return context
}
