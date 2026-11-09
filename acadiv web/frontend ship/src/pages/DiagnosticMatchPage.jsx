import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { MatchIcon, SaveIcon, AssessmentIcon } from '../components/icons/AcadivIcons'

export default function DiagnosticMatchPage() {
  const { user } = useAuth()
  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ikigaiNotes, setIkigaiNotes] = useState({ love: '', goodAt: '', worldNeeds: '', paidFor: '' })
  const [ikigaiMsg, setIkigaiMsg] = useState(null)
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    async function loadMatch() {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        const res = await api('/profile/match', { auth: true })
        setMatchData(res.data?.result || null)
      } catch (err) {
        console.error('Failed to load profile match:', err)
      } finally {
        setLoading(false)
      }
    }
    loadMatch()
  }, [user])

  const handleSaveReflection = async () => {
    setSavingNotes(true)
    setIkigaiMsg(null)
    try {
      // Store relevant interests to student profile via PATCH /profile
      const interests = [ikigaiNotes.love, ikigaiNotes.worldNeeds].filter(Boolean)
      if (interests.length > 0) {
        await api('/profile', {
          method: 'PATCH',
          auth: true,
          body: {
            careerInterests: interests,
            academicPreferences: [ikigaiNotes.goodAt, ikigaiNotes.paidFor].filter(Boolean),
          },
        })
      }
      // Cache notes locally
      localStorage.setItem(`acadiv_ikigai_${user?._id}`, JSON.stringify(ikigaiNotes))
      setIkigaiMsg('Reflection saved to profile and browser cache.')
    } catch (err) {
      setIkigaiMsg(`Note: Stored in browser cache. (${err.message})`)
      localStorage.setItem(`acadiv_ikigai_${user?._id}`, JSON.stringify(ikigaiNotes))
    } finally {
      setSavingNotes(false)
    }
  }

  // Load cached reflection notes
  useEffect(() => {
    if (user?._id) {
      try {
        const cached = localStorage.getItem(`acadiv_ikigai_${user._id}`)
        if (cached) setIkigaiNotes(JSON.parse(cached))
      } catch {
        /* ignore */
      }
    }
  }, [user])

  if (loading) {
    return (
      <div style={{ maxWidth: '880px', margin: '40px auto' }}>
        <div className="skeleton" style={{ height: '36px', width: '320px', marginBottom: '24px' }} />
        <div className="grid-cols-2" style={{ gap: '20px' }}>
          <div className="skeleton" style={{ height: '240px' }} />
          <div className="skeleton" style={{ height: '240px' }} />
        </div>
      </div>
    )
  }

  if (!matchData) {
    return (
      <div style={{ maxWidth: '680px', margin: '60px auto', textAlign: 'center' }}>
        <div className="empty-state">
          <div className="empty-icon" style={{ color: 'var(--teal)', display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <AssessmentIcon size={44} />
          </div>
          <h2 className="empty-title">No Completed Assessment Found</h2>
          <p className="empty-text">
            Complete our 15–20 question Holland assessment to calculate your verified RIASEC code and explainable career match breakdown.
          </p>
          <Link to="/assessment" className="btn btn-forest">
            Begin RIASEC Assessment →
          </Link>
        </div>
      </div>
    )
  }

  const dimensions = [
    { key: 'R', label: 'Realistic', color: '#174B43', desc: 'Practical, technical tools, physical engineering' },
    { key: 'I', label: 'Investigative', color: '#34B9A5', desc: 'Analytical, scientific research, algorithmic problem solving' },
    { key: 'A', label: 'Artistic', color: '#7568D8', desc: 'Creative, UX/UI, digital design, expressive systems' },
    { key: 'S', label: 'Social', color: '#34B9A5', desc: 'Mentorship, healthcare, community development, teaching' },
    { key: 'E', label: 'Enterprising', color: '#E47B60', desc: 'Leadership, tech startups, business growth, persuasion' },
    { key: 'C', label: 'Conventional', color: '#667779', desc: 'Data structures, organization, financial audits, systems' },
  ]

  const scores = matchData.normalizedScores || {}

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* Top Banner with Holland Code */}
      <div
        className="card"
        style={{
          padding: '40px 36px',
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-verified">Diagnostic Profile</span>
            <span className="badge badge-forest">Engine: riasec-pk-v1</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', margin: '6px 0 12px' }}>
            Holland Code: <span style={{ color: 'var(--teal)', letterSpacing: '0.08em' }}>{matchData.hollandCode}</span>
          </h1>
          <p style={{ maxWidth: '600px', fontSize: '0.98rem', lineHeight: '1.6' }}>
            Your primary dimensions reflect your verified inclinations scored across realistic Karachi academic scenarios.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/roadmap" className="btn btn-forest">
            Explore 3D Roadmap →
          </Link>
          <Link to="/skill-gap" className="btn btn-outline">
            Skill-Gap Analysis
          </Link>
        </div>
      </div>

      {/* 6 Dimension Visualizations */}
      <div className="card" style={{ padding: '36px' }}>
        <h3 style={{ fontSize: '1.35rem', marginBottom: '24px' }}>
          Normalized Dimension Distribution (0–100%)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {dimensions.map((d) => {
            const val = scores[d.key] || 0
            return (
              <div key={d.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.92rem' }}>
                  <div>
                    <strong style={{ color: 'var(--ink)' }}>{d.key} — {d.label}</strong>{' '}
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.84rem' }}>({d.desc})</span>
                  </div>
                  <div style={{ fontWeight: 800, color: d.color }}>{val}%</div>
                </div>
                <div style={{ width: '100%', height: '10px', borderRadius: 'var(--radius-full)', background: 'var(--surface-alt)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div
                    style={{
                      width: `${val}%`,
                      height: '100%',
                      background: d.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Plausible Aligned Career Directions */}
      <div>
        <h3 style={{ fontSize: '1.35rem', marginBottom: '18px' }}>
          Explainable Career Recommendations
        </h3>
        <div className="grid-cols-2" style={{ gap: '20px' }}>
          {matchData.recommendedCareers?.length ? (
            matchData.recommendedCareers.map((c) => (
              <div key={c.careerId || c.title} className="card" style={{ padding: '28px', border: '1.5px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '1.25rem', color: 'var(--ink)' }}>{c.title}</h4>
                  <span className="badge badge-verified">Aligned</span>
                </div>
                <p style={{ fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.55', color: 'var(--text-muted)' }}>
                  {c.description}
                </p>
                <div style={{ fontSize: '0.84rem', color: 'var(--forest)', background: 'var(--teal-soft)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '18px' }}>
                  <strong>Scoring Rationale:</strong> Strong correspondence with high {matchData.hollandCode?.slice(0, 2)} dimensional weighting in technical modeling and structured execution.
                </div>
                <Link to="/roadmap" className="btn btn-forest btn-sm" style={{ width: '100%' }}>
                  View Pathway on 3D Roadmap
                </Link>
              </div>
            ))
          ) : (
            <div className="card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '32px' }}>
              <p>Explore recommended career directions on your interactive roadmap.</p>
              <Link to="/roadmap" className="btn btn-forest btn-sm" style={{ marginTop: '14px' }}>
                Open 3D Roadmap
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Auditable Reason Trace */}
      <div className="card" style={{ padding: '32px', background: 'var(--surface-alt)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Auditable Scoring Provenance</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          This trace is deterministically calculated from your recorded answers against versioned scoring rules (`riasec-pk-v1`).
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--ink)' }}>
          {matchData.reasonTrace?.map((item, idx) => (
            <li key={idx} style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              • {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Optional Ikigai Reflection */}
      <div className="card" style={{ padding: '36px' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Personal Alignment Reflection</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Capture qualitative reflections separate from numeric RIASEC scoring to fine-tune your roadmap choices.
        </p>

        {ikigaiMsg && (
          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--teal-soft)', border: '1px solid var(--teal)', color: 'var(--forest)', fontSize: '0.9rem', marginBottom: '20px' }}>
            {ikigaiMsg}
          </div>
        )}

        <div className="grid-cols-2" style={{ gap: '18px', marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">What You Genuinely Enjoy</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Building tools, debugging algorithms"
              value={ikigaiNotes.love}
              onChange={(e) => setIkigaiNotes({ ...ikigaiNotes, love: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skills You Are Developing</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. JavaScript, advanced calculus, Figma"
              value={ikigaiNotes.goodAt}
              onChange={(e) => setIkigaiNotes({ ...ikigaiNotes, goodAt: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">What Industry / Karachi Needs</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Full-stack engineers, cloud security"
              value={ikigaiNotes.worldNeeds}
              onChange={(e) => setIkigaiNotes({ ...ikigaiNotes, worldNeeds: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Economically Sustainable Direction</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Software house roles, global remote"
              value={ikigaiNotes.paidFor}
              onChange={(e) => setIkigaiNotes({ ...ikigaiNotes, paidFor: e.target.value })}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-forest btn-sm"
          disabled={savingNotes}
          onClick={handleSaveReflection}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <SaveIcon size={14} />
          <span>{savingNotes ? 'Saving...' : 'Save Reflection to Profile'}</span>
        </button>
      </div>
    </div>
  )
}
