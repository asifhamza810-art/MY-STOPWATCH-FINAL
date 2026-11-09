import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AcadivLogo from '../components/brand/AcadivLogo'

export default function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register({ displayName, email, password })
      // New user goes directly to Dual-Path Onboarding
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be in use.')
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
          maxWidth: '480px',
          padding: '40px 36px',
          background: 'var(--surface)',
        }}
      >
        <span className="badge badge-featured" style={{ marginBottom: '8px' }}>
          Free Student Account
        </span>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Create Your Acadiv Account</h1>
        <p style={{ fontSize: '0.92rem', marginBottom: '24px' }}>
          Track Karachi admissions, calculate your RIASEC profile, and build your interactive 3D roadmap.
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
            <label className="form-label">Full Name or Preferred Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Fatima Zahra"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min. 6 characters)</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-teal"
            style={{ width: '100%', marginTop: '12px', padding: '13px' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Get Started with Acadiv →'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--forest)', fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  )
}

