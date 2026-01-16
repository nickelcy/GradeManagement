import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useUser } from '../../context/UserContext'

type ProfileProps = {
    isOpen: boolean
    onClose: () => void
}

export const Profile = ({ isOpen, onClose }: ProfileProps) => {
  const { userId } = useAuth()
  const { profile, loading, error, refresh } = useUser()
  const [formData, setFormData] = useState({
    staffId: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  })
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      void refresh()
    }
  }, [isOpen, refresh])

  useEffect(() => {
    if (!profile) {
      setFormData({
        staffId: userId ? String(userId) : '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
      })
      setSaveStatus(null)
      return
    }
    setFormData({
      staffId: profile.staffId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      password: '',
      confirmPassword: '',
    })
    setSaveStatus(null)
  }, [profile, userId])

  const passwordsMatch =
    !formData.password && !formData.confirmPassword
      ? true
      : formData.password === formData.confirmPassword
  const passwordError = passwordsMatch ? null : 'Passwords do not match.'

  const handleUpdate = async () => {
    setSaveStatus(null)
    setIsSaving(true)
    try {
      const payload = {
        ...(formData.firstName.trim()
          ? { first_name: formData.firstName.trim() }
          : {}),
        ...(formData.lastName.trim()
          ? { last_name: formData.lastName.trim() }
          : {}),
        ...(formData.password.trim()
          ? { password: formData.password }
          : {}),
      }
      if (Object.keys(payload).length === 0) {
        setSaveStatus('Please enter at least one field to update.')
        return
      }
      await api.put('/profile', payload)
      setSaveStatus('Profile updated successfully.')
      await refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed.'
      setSaveStatus(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="profile-overlay" role="presentation" onClick={onClose}>
      <section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Profile settings"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="profile-header">
          <h2>Profile</h2>
          <button type="button" className="profile-close" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="profile-body">
          <label className="profile-field">
            <span>Staff Id</span>
            <input type="text" name="staff_id" disabled value={formData.staffId} />
          </label>
          <label className="profile-field">
            <span>Firstname</span>
            <input
              type="text"
              name="firstname"
              value={formData.firstName}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, firstName: event.target.value }))
              }
            />
          </label>
          <label className="profile-field">
            <span>Lastname</span>
            <input
              type="text"
              name="lastname"
              value={formData.lastName}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, lastName: event.target.value }))
              }
            />
          </label>
          <label className="profile-field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, password: event.target.value }))
              }
            />
          </label>
          <label className="profile-field">
            <span>Confirm Password</span>
            <input
              type="password"
              name="confirm"
              id="confirm"
              value={formData.confirmPassword}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
            />
          </label>
        </div>
        {(loading || error || passwordError || saveStatus) && (
          <p className="profile-status" role="status" aria-live="polite">
            {loading
              ? 'Loading profile...'
              : passwordError ?? error ?? saveStatus}
          </p>
        )}
        <div className="profile-actions">
          <button type="button" className="profile-button ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="profile-button primary"
            disabled={!passwordsMatch}
            onClick={handleUpdate}
          >
            {isSaving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </section>
    </div>
  )
}
