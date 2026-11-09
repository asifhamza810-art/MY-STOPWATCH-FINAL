import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function PortfolioPage() {
  const { username } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { user } = useAuth()

  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)

  // Edit mode for own profile
  const [isEditing, setIsEditing] = useState(false)
  const [editHeadline, setEditHeadline] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editSkills, setEditSkills] = useState('')
  const [editInstitution, setEditInstitution] = useState('')
  const [editProgramme, setEditProgramme] = useState('')
  const [editStage, setEditStage] = useState('')
  const [editYearNote, setEditYearNote] = useState('')
  const [editVisibility, setEditVisibility] = useState('public')
  const [saving, setSaving] = useState(false)

  const isOwnProfile = user && (!username || username === 'me' || username.toLowerCase() === user.displayName?.toLowerCase().replace(/\s+/g, ''))

  const loadPortfolio = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isOwnProfile) {
        const res = await api('/portfolio/me', { auth: true })
        if (res.data) {
          setPortfolio(res.data)
          setEditHeadline(res.data.headline || '')
          setEditBio(res.data.biography || '')
          setEditSkills((res.data.selectedSkills || []).join(', '))
          setEditVisibility(res.data.visibility || 'public')
          if (res.data.educationRecords?.length > 0) {
            const firstEdu = res.data.educationRecords[0]
            setEditInstitution(firstEdu.institution || '')
            setEditProgramme(firstEdu.programme || '')
            setEditStage(firstEdu.stage || '')
            setEditYearNote(firstEdu.yearNote || '')
          }
        } else {
          setIsEditing(true)
        }
      } else {
        let path = `/portfolio/${username}`
        if (token) path += `?token=${token}`
        const res = await api(path)
        setPortfolio(res.data)
      }
    } catch (err) {
      setError(err.message || 'Portfolio not found or set to private by the student.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPortfolio()
  }, [username, isOwnProfile, token])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatusMsg(null)
    try {
      const uName = portfolio?.username || user.displayName?.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'student'
      const skillArray = editSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const eduRecords = editInstitution ? [
        {
          institution: editInstitution,
          programme: editProgramme,
          stage: editStage,
          yearNote: editYearNote,
        },
      ] : []

      const res = await api('/portfolio/me', {
        method: 'PUT',
        auth: true,
        body: {
          username: uName,
          headline: editHeadline,
          biography: editBio,
          visibility: editVisibility,
          selectedSkills: skillArray,
          educationRecords: eduRecords,
        },
      })
      setPortfolio(res.data)
      setIsEditing(false)
      setStatusMsg('Portfolio updated and synchronized to database.')
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const handlePrintCv = () => {
    window.print()
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '840px', margin: '40px auto' }}>
        <div className="skeleton" style={{ height: '36px', width: '260px', marginBottom: '20px' }} />
        <div className="skeleton" style={{ height: '180px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
      </div>
    )
  }

  if (error && !portfolio) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 32px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ marginBottom: '12px' }}>Portfolio Restricted or Not Found</h2>
          <p style={{ maxWidth: '440px', margin: '0 auto 24px' }}>{error}</p>
          <Link to="/explore" className="btn btn-primary">
            Return to Explore Hub →
          </Link>
        </div>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '40px 36px', border: '1.5px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <span className="badge badge-forest" style={{ marginBottom: '6px' }}>Portfolio Workspace</span>
              <h2 style={{ fontSize: '1.8rem' }}>Edit Your Student Portfolio</h2>
            </div>
            {portfolio && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsEditing(false)}>
                ✕ Close
              </button>
            )}
          </div>

          {statusMsg && (
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--coral-soft)', border: '1px solid var(--coral)', color: '#C24B2F', marginBottom: '20px', fontSize: '0.9rem' }}>
              {statusMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Professional Headline</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Intermediate Pre-Engineering Student | Aspiring Full-Stack Software Engineer"
                value={editHeadline}
                onChange={(e) => setEditHeadline(e.target.value)}
                maxLength={160}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student Biography & Career Targets</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Describe your genuine academic background, technologies you are studying, and target degree or career pathway in Pakistan."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                maxLength={2000}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Self-Declared Skills (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. JavaScript, Python, React, Data Structures, Figma"
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Only list skills you have genuinely practiced or studied.
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px', marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '14px', fontSize: '1.1rem' }}>Academic Record</h4>
              <div className="grid-cols-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Institution / College Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. DJ Sindh Govt Science College / Adamjee"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Programme / Stream</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. HSC Pre-Engineering / Computer Science"
                    value={editProgramme}
                    onChange={(e) => setEditProgramme(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Education Stage</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Intermediate Part 1"
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Graduation Year / Batch</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2024–2026"
                    value={editYearNote}
                    onChange={(e) => setEditYearNote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Visibility Setting</label>
              <select
                className="form-select"
                value={editVisibility}
                onChange={(e) => setEditVisibility(e.target.value)}
              >
                <option value="public">Public — Anyone with your link can view</option>
                <option value="unlisted">Unlisted — Only accessible via direct token link</option>
                <option value="private">Private — Accessible only when logged into your account</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button type="submit" className="btn btn-forest" disabled={saving}>
                {saving ? 'Saving...' : 'Save & Publish Portfolio'}
              </button>
              {portfolio && (
                <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Banner / Hero Card */}
      <div
        className="card"
        style={{
          padding: '40px 36px',
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-forest">
              {portfolio?.visibility === 'public' ? 'Public Portfolio' : portfolio?.visibility === 'unlisted' ? 'Unlisted' : 'Private'}
            </span>
            <span className="badge badge-subtle">@{portfolio?.username || username || 'student'}</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>
            {user?.displayName || portfolio?.displayName || 'Student Profile'}
          </h1>

          {portfolio?.headline ? (
            <p style={{ fontSize: '1.08rem', color: 'var(--teal)', fontWeight: 600, marginBottom: '14px' }}>
              {portfolio.headline}
            </p>
          ) : (
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '14px' }}>
              No professional headline set yet.
            </p>
          )}

          {portfolio?.biography ? (
            <p style={{ maxWidth: '640px', fontSize: '0.95rem', lineHeight: '1.65' }}>
              {portfolio.biography}
            </p>
          ) : (
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No biography provided yet.
            </p>
          )}
        </div>

        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button type="button" className="btn btn-forest btn-sm" onClick={handlePrintCv}>
            📄 Export ATS-Friendly CV (PDF)
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleCopyLink}>
            {copied ? '✓ Copied Link!' : '🔗 Copy Share Link'}
          </button>
          {isOwnProfile && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>
              ✏️ Edit Portfolio
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div style={{ padding: '12px 18px', borderRadius: 'var(--radius-md)', background: 'var(--teal-soft)', border: '1px solid var(--teal)', color: 'var(--forest)', fontSize: '0.9rem' }}>
          {statusMsg}
        </div>
      )}

      {/* Student Self-Declared Competencies */}
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.3rem' }}>Demonstrated Competencies</h3>
          <span className="badge badge-subtle">Self-Reported & Course Evidence</span>
        </div>

        {portfolio?.selectedSkills?.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {portfolio.selectedSkills.map((skill, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.88rem',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--teal-soft)',
                  border: '1px solid var(--teal)',
                  color: 'var(--forest)',
                  fontWeight: 600,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No skills explicitly declared yet. {isOwnProfile && 'Click "Edit Portfolio" to add your skills.'}
          </p>
        )}
      </div>

      {/* Academic Qualifications */}
      <div className="card" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Academic History</h3>
        {portfolio?.educationRecords?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {portfolio.educationRecords.map((edu, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--canvas)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--forest)' }}>
                    {edu.institution || 'Educational Institution'}
                  </strong>
                  {edu.yearNote && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      {edu.yearNote}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>
                  {edu.programme} {edu.stage ? `(${edu.stage})` : ''}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No academic qualifications added yet. {isOwnProfile && 'Click "Edit Portfolio" to add your institution history.'}
          </p>
        )}
      </div>

      {/* Verified Artifacts / Evidence */}
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.3rem' }}>Demonstrable Artifacts & Code</h3>
          {isOwnProfile && (
            <Link to="/vault" className="btn btn-outline btn-sm no-print">
              Manage in Vault →
            </Link>
          )}
        </div>

        {portfolio?.selectedArtifactIds?.length > 0 ? (
          <div className="grid-cols-2" style={{ gap: '16px' }}>
            {portfolio.selectedArtifactIds.map((art) => (
              <div
                key={art._id || art}
                style={{
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--canvas)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-subtle">{art.category || 'project'}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {art.verificationStatus === 'verified' ? '✓ Verified' : 'Artifact Uploaded'}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>{art.title || 'Student Project'}</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>{art.description}</p>
                {art.projectUrl && (
                  <a href={art.projectUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--teal)', fontWeight: 600 }}>
                    View Repository / Link ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No project artifacts linked to portfolio yet. Upload evidence in your Artifact Vault to showcase real code and certificates.
          </p>
        )}
      </div>
    </div>
  )
}
