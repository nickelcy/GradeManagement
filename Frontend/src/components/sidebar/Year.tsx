import { useMemo, useState } from 'react'
import { FiCalendar, FiChevronDown } from 'react-icons/fi'
import { useYear } from '../../context/YearContext'
import './Year.css'

export const Year = () => {
  const { years, selectedYearId, setSelectedYearId, loading } = useYear()
  const [open, setOpen] = useState(false)

  const options = useMemo(
    () =>
      years.map((year) => ({
        id: String(year.academic_year_id),
        label: `${year.year_label - 1} / ${year.year_label}`,
      })),
    [years],
  )

  const selectedLabel =
    options.find((option) => option.id === selectedYearId)?.label ?? 'Select year'

  return (
    <div className="sidebar-year">
      <div className={`dropdown ${open ? 'open' : ''}`}>
        <button
          type="button"
          className="dropdown-trigger"
          onClick={() => setOpen((prev) => !prev)}
          disabled={loading}
          aria-expanded={open}
        >
          <span className="dropdown-trigger-text">
            <FiCalendar aria-hidden="true" />
            {selectedLabel}
          </span>
          <FiChevronDown className={`arrow ${open ? 'open' : ''}`} aria-hidden="true" />
        </button>
        {open && (
          <div className="dropdown-menu">
            {options.length === 0 && (
              <div className="dropdown-item muted">No years available</div>
            )}
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`dropdown-item ${
                  option.id === selectedYearId ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedYearId(option.id)
                  setOpen(false)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
