import { useState } from 'react'
import { type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  const { login, loading, error, token } = useAuth()
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    try {
      await login(staffId.trim(), password)
      setStatus('Login successful.')
    } catch {
      setStatus('Login failed. Please check your staff ID and password.')
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Staff Id</span>
            <input
              type="text"
              name="staff_id"
              autoComplete="username"
              value={staffId}
              onChange={(event) => setStaffId(event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'login'}
          </button>
        </form>

        <div className="login-status" role="status" aria-live="polite">
          {error && <span>{error}</span>}
          {!error && status && <span>{status}</span>}
          {!error && !status && token && <span>Authenticated.</span>}
        </div>
      </section>
    </main>
  )
}

export default Login
