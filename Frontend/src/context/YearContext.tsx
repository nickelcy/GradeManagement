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

export type AcademicYear = {
  academic_year_id: number
  year_label: number
  start_date: string
  end_date: string
  is_active: number
}

type YearContextValue = {
  years: AcademicYear[]
  selectedYearId: string
  setSelectedYearId: (value: string) => void
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const YearContext = createContext<YearContextValue | undefined>(undefined)

type YearProviderProps = {
  children: ReactNode
}

const pickDefaultYearId = (years: AcademicYear[]) => {
  const active = years.find((year) => year.is_active === 1)
  if (active) {
    return String(active.academic_year_id)
  }
  const mostRecent = years[0]
  return mostRecent ? String(mostRecent.academic_year_id) : ''
}

export const YearProvider = ({ children }: YearProviderProps) => {
  const { token } = useAuth()
  const [years, setYears] = useState<AcademicYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchYears = useCallback(async () => {
    if (!token) {
      setYears([])
      setSelectedYearId('')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/years')
      const data = response.data?.data ?? []
      setYears(data)
      if (!selectedYearId) {
        setSelectedYearId(pickDefaultYearId(data))
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load years.'
      setError(message)
      setYears([])
    } finally {
      setLoading(false)
    }
  }, [selectedYearId, token])

  useEffect(() => {
    void fetchYears()
  }, [fetchYears])

  const value = useMemo(
    () => ({
      years,
      selectedYearId,
      setSelectedYearId,
      loading,
      error,
      refresh: fetchYears,
    }),
    [years, selectedYearId, loading, error, fetchYears],
  )

  return <YearContext.Provider value={value}>{children}</YearContext.Provider>
}

export const useYear = () => {
  const context = useContext(YearContext)
  if (!context) {
    throw new Error('useYear must be used within a YearProvider.')
  }
  return context
}
