import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CloseIcon } from '../icons/AcadivIcons'

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (isRegister) {
        await register({ email, password, displayName: displayName || email.split('@')[0] })
      } else {
        await login(email, password)
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
          <CloseIcon size={18} />
        </button>

        <h3 style={{ marginBottom: '8px' }}>
          {isRegister ? 'Create Student Account' : 'Welcome Back to Acadiv'}
        </h3>
        <p style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
          {isRegister
            ? 'Save your RIASEC assessment, custom roadmap, and evidence vault.'
            : 'Sign in to access your persistent roadmaps and portfolio records.'}
        </p>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              fontSize: '0.88rem',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name or Preferred Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Fatima Zahra"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}

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
            <label className="form-label">Password</label>
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
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => {
                  setIsRegister(false)
                  setError(null)
                }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to Acadiv?{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--cyan)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => {
                  setIsRegister(true)
                  setError(null)
                }}
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

