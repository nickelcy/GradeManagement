import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import api, { setAuthToken } from '../utils/api'

type AuthContextValue = {
  token: string | null
  roleId: number | null
  userId: number | null
  loading: boolean
  error: string | null
  login: (staffId: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'grms_token'

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null)
  const [roleId, setRoleId] = useState<number | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodeToken = useCallback((rawToken: string) => {
    try {
      const payload = rawToken.split('.')[1]
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
      const nextRoleId = typeof decoded.role === 'number' ? decoded.role : Number(decoded.role)
      const nextUserId = typeof decoded.sub === 'number' ? decoded.sub : Number(decoded.sub)
      setRoleId(Number.isFinite(nextRoleId) ? nextRoleId : null)
      setUserId(Number.isFinite(nextUserId) ? nextUserId : null)
    } catch {
      setRoleId(null)
      setUserId(null)
    }
  }, [])

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY)
    if (storedToken) {
      setToken(storedToken)
      decodeToken(storedToken)
      setAuthToken(storedToken)
    }
  }, [decodeToken])

  const login = useCallback(async (staffId: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/login', {
        staff_id: staffId,
        password,
      })
      const nextToken = response.data?.token as string | undefined
      if (!nextToken) {
        throw new Error('Missing token in response.')
      }
      setToken(nextToken)
      decodeToken(nextToken)
      localStorage.setItem(STORAGE_KEY, nextToken)
      setAuthToken(nextToken)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setRoleId(null)
    setUserId(null)
    localStorage.removeItem(STORAGE_KEY)
    setAuthToken(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      roleId,
      userId,
      loading,
      error,
      login,
      logout,
    }),
    [token, roleId, userId, loading, error, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }
  return context
}
