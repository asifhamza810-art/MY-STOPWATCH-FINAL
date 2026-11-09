import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AcadivLogo from '../components/brand/AcadivLogo'
import OrganicCrumbleMotif from '../components/brand/OrganicCrumbleMotif'
import {
  CheckIcon,
  RoadmapIcon,
  AssessmentIcon,
  VaultIcon,
  ArrowRightIcon,
  StarIcon,
} from '../components/icons/AcadivIcons'

export default function SignupPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [stage, setStage] = useState('HSC Pre-Engineering')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setSubmitting(true)
    try {
      await register({ displayName, email, password, educationStage: stage })
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be associated with an account.')
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
        justifyContent: 'space-between',
        background: 'var(--canvas)',
      }}
    >
      {/* Top Brand Bar */}
      <header
        style={{
          padding: '24px 32px',
          maxWidth: '1360px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <AcadivLogo variant="full" size="md" asLink to="/" />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--forest)', fontWeight: 700, textDecoration: 'underline' }}>
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Registration Layout (Split Editorial Composition) */}
      <main
        style={{
          flex: 1,
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '20px 24px 60px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Reassurance, Student Value & Trust Narrative */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: 'var(--radius-full)', background: 'var(--teal-soft)', color: 'var(--forest)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '16px' }}>
              <StarIcon size={14} />
              <span>100% Free For Pakistani Students</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.03em' }}>
              Your Karachi Education & Career Journey Starts Here.
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '520px' }}>
              Join thousands of Karachi students navigating college cutoffs, entrance exams, accredited universities, and demonstrable portfolios without guesswork.
            </p>
          </div>

          {/* Value Propositions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ padding: '8px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', color: 'var(--forest)', flexShrink: 0 }}>
                <RoadmapIcon size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>Persistent 3D Career Roadmap</strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Visualize multi-year milestones from Matric/FSc to FAST, NED, IBA, or DUHS entry exams and job placement.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ padding: '8px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', color: 'var(--forest)', flexShrink: 0 }}>
                <AssessmentIcon size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>Explainable RIASEC Diagnostic Match</strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Contextual Pakistani scenario assessment calculating normalized Holland scores and transparent career rationales.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ padding: '8px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', color: 'var(--forest)', flexShrink: 0 }}>
                <VaultIcon size={20} />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>Student Evidence Vault & ATS CV</strong>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Store real code repositories, course certificates, and export a verified, recruiter-ready ATS curriculum vitae.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Provenance Guarantee */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ color: 'var(--teal)', flexShrink: 0 }}>
              <CheckIcon size={18} />
            </div>
            <span>
              <strong>Zero Data Monetization:</strong> Acadiv does not sell your transcripts, grades, or personal assessment results to advertisers or coaching agencies.
            </span>
          </div>
        </div>

        {/* Right Column: Registration Card */}
        <div>
          <div
            className="card"
            style={{
              padding: '40px 36px',
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <span className="badge badge-forest" style={{ marginBottom: '8px' }}>
                Quick Registration
              </span>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Create Your Account</h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                Takes less than 60 seconds. No credit card required.
              </p>
            </div>

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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name or Preferred Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Syed Hamza"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
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

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Current Academic Level</label>
                <select
                  className="form-select"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                >
                  <option value="Matriculation">Matriculation (Science — BIEK / Federal)</option>
                  <option value="HSC Pre-Engineering">Intermediate / HSC Pre-Engineering</option>
                  <option value="HSC Pre-Medical">Intermediate / HSC Pre-Medical</option>
                  <option value="HSC ICS">Intermediate / ICS (Math, CS, Physics)</option>
                  <option value="DAE">DAE (SBTE 3-Year Technical Diploma)</option>
                  <option value="O-Level">O-Level (Cambridge CAIE)</option>
                  <option value="A-Level">A-Level (Cambridge CAIE)</option>
                  <option value="Undergraduate">Current University Undergraduate</option>
                </select>
              </div>

              <div className="grid-cols-2" style={{ gap: '14px', marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
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

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-forest btn-lg"
                style={{ width: '100%', marginTop: '12px', gap: '10px' }}
                disabled={submitting}
              >
                {submitting ? 'Creating Student Profile...' : 'Complete Registration'}
                {!submitting && <ArrowRightIcon size={16} />}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                By signing up, you agree to Acadiv's academic research and zero-spam ethics.
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Decorative Organic Crumble Horizon at Base */}
      <OrganicCrumbleMotif variant="hero" />
    </div>
  )
}
