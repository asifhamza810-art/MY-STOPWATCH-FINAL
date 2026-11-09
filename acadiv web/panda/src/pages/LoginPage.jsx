import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AcadivLogo from '../components/brand/AcadivLogo'

export default function LoginPage() {
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const from = location.state?.from?.pathname || '/explore'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please verify credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        background: 'var(--canvas)',
      }}
    >
      <div style={{ marginBottom: '32px' }}>
        <AcadivLogo variant="full" size="lg" asLink to="/" />
      </div>

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px 36px',
          background: 'var(--surface)',
        }}
      >
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Sign In to Acadiv</h1>
        <p style={{ fontSize: '0.92rem', marginBottom: '24px' }}>
          Access your persistent 3D roadmap, verified evidence vault, and diagnostic profile.
        </p>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--coral-soft)',
              border: '1px solid var(--coral)',
              color: '#C24B2F',
              fontSize: '0.88rem',
              marginBottom: '20px',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '13px' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          New to Acadiv?{' '}
          <Link to="/signup" style={{ color: 'var(--forest)', fontWeight: 700 }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  )
}

