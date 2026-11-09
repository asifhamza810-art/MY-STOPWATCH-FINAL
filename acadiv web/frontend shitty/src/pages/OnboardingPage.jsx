import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [track, setTrack] = useState(null) // 'fast' | 'guided'

  // Fast track form state
  const [stage, setStage] = useState('HSC Pre-Engineering')
  const [stream, setStream] = useState('Computer Science & Engineering')
  const [targetField, setTargetField] = useState('software-engineer')
  const [budget, setBudget] = useState('flexible')
  const [city, setCity] = useState('Karachi')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleFastTrackSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (user) {
        await api('/profile', {
          method: 'PATCH',
          auth: true,
          body: {
            educationStage: stage,
            educationStream: stream,
            academicPreferences: { budget, targetField },
            city,
          },
        })
      }
      navigate('/roadmap')
    } catch (err) {
      console.error('Fast track profile save failed:', err)
      setError(err.message || 'Unable to save profile configuration to server. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ textAlign: 'center' }}>
        <span className="badge badge-verified" style={{ marginBottom: '12px' }}>
          Dual-Path Academic Onboarding
        </span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>How Would You Like to Start?</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.02rem' }}>
          Select the onboarding path that matches your current academic certainty. You can adjust your targets and preferences at any point.
        </p>
      </div>

      {!track ? (
        <div className="grid-cols-2" style={{ gap: '28px' }}>
          {/* Option A: Fast Track */}
          <div
            className="card"
            style={{
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: '1.5px solid var(--border)',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setTrack('fast')}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--teal)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <div>
              <div style={{ fontSize: '2.6rem', marginBottom: '16px' }}>⚡</div>
              <span className="badge badge-forest" style={{ marginBottom: '10px' }}>Direct Route</span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Fast Track Planning</h2>
              <p style={{ fontSize: '0.94rem', marginBottom: '24px', lineHeight: '1.6' }}>
                Already know your current qualification and intended career? Select your Matric, Intermediate, or A-Levels stream and jump straight into your personalized 3D roadmap.
              </p>
              <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>✓ Select HSC Pre-Eng / ICS / Pre-Med / DAE / A-Levels</li>
                <li>✓ Configure target field (Tech, Health, Engineering, CA)</li>
                <li>✓ Immediate interactive pathway graph</li>
              </ul>
            </div>

            <button
              type="button"
              className="btn btn-forest"
              style={{ marginTop: '36px', width: '100%' }}
              onClick={() => setTrack('fast')}
            >
              Choose Fast Track →
            </button>
          </div>

          {/* Option B: Guided Assessment */}
          <div
            className="card"
            style={{
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: '1.5px solid var(--border)',
              transition: 'all 0.2s ease',
            }}
            onClick={() => navigate('/assessment')}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--teal)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <div>
              <div style={{ fontSize: '2.6rem', marginBottom: '16px' }}>🎯</div>
              <span className="badge badge-verified" style={{ marginBottom: '10px' }}>Adaptive Exploration</span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Guided RIASEC Test</h2>
              <p style={{ fontSize: '0.94rem', marginBottom: '24px', lineHeight: '1.6' }}>
                Exploring options or looking for validation? Complete our 15–20 question Pakistani scenario engine to generate a verified Holland code, match breakdown, and pathway recommendations.
              </p>
              <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>✓ Contextual Karachi student moments</li>
                <li>✓ 6 Holland occupational dimensions</li>
                <li>✓ Transparent, explainable career rationale</li>
              </ul>
            </div>

            <button
              type="button"
              className="btn btn-teal"
              style={{ marginTop: '36px', width: '100%' }}
              onClick={() => navigate('/assessment')}
            >
              Start Guided Assessment →
            </button>
          </div>
        </div>
      ) : (
        /* Fast Track Configuration Form */
        <div className="card" style={{ padding: '40px 36px', border: '1.5px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div>
              <span className="badge badge-forest" style={{ marginBottom: '6px' }}>Step 2 of 2</span>
              <h2 style={{ fontSize: '1.6rem' }}>Configure Your Academic Profile</h2>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => { setTrack(null); setError(null) }}
            >
              ← Change Path
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--coral-soft)',
                border: '1px solid var(--coral)',
                color: '#C24B2F',
                fontSize: '0.92rem',
                marginBottom: '24px',
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleFastTrackSubmit}>
            <div className="form-group">
              <label className="form-label">Current Education Stage</label>
              <select
                className="form-select"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                <option value="Matriculation Science">Matriculation (Science — BIEK / Federal)</option>
                <option value="HSC Pre-Engineering">Intermediate / HSC Pre-Engineering (BIEK)</option>
                <option value="HSC Pre-Medical">Intermediate / HSC Pre-Medical (BIEK)</option>
                <option value="HSC ICS">Intermediate / ICS (Math, Physics, Computer Science)</option>
                <option value="HSC General Science">Intermediate / General Science</option>
                <option value="HSC Commerce">Intermediate / Commerce</option>
                <option value="DAE Technical">DAE (Diploma of Associate Engineering — SBTE)</option>
                <option value="O-Level">O-Level (Cambridge CAIE / Edexcel)</option>
                <option value="A-Level">A-Level (Cambridge CAIE / Edexcel)</option>
                <option value="Undergraduate Current">Current University Undergraduate</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Career Discipline</label>
              <select
                className="form-select"
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
              >
                <option value="software-engineer">Software Engineering & Web Development</option>
                <option value="data-analyst">Data Science & Business Intelligence</option>
                <option value="ux-designer">Digital Product & UI/UX Design</option>
                <option value="mechanical-engineer">Mechanical & Robotics Engineering</option>
                <option value="electrical-engineer">Electrical & Electronics Engineering</option>
                <option value="doctor-mbbs">Doctor (MBBS / Dental BDS)</option>
                <option value="chartered-accountant">Chartered Accountancy (CA / ACCA)</option>
                <option value="digital-marketer">Digital Marketing & Growth</option>
              </select>
            </div>

            <div className="grid-cols-2">
              <div className="form-group">
                <label className="form-label">Primary City</label>
                <input
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Karachi"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Semester Budget Target</label>
                <select
                  className="form-select"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option value="subsidized">Subsidized Merit / Public (NED, KU, DUHS: Rs 30k–65k)</option>
                  <option value="moderate">Moderate Semi-Govt / Tier-2 (Rs 85k–150k)</option>
                  <option value="flexible">Private Tier-1 (FAST, IBA, Habib: Rs 190k+)</option>
                  <option value="bootcamp">Subsidized Training Bootcamps (SMIT, Jawan: Rs 0–15k)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-forest btn-lg"
              style={{ width: '100%', marginTop: '20px' }}
              disabled={saving}
            >
              {saving ? 'Saving Academic Profile...' : 'Launch Interactive Roadmap →'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
