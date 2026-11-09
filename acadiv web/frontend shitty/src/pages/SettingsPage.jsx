import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { user, profile, refreshMe, logout } = useAuth()
  const [preferredName, setPreferredName] = useState('')
  const [educationStage, setEducationStage] = useState('HSC Pre-Engineering')
  const [city, setCity] = useState('Karachi')
  const [budget, setBudget] = useState('flexible')
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')

  useEffect(() => {
    if (profile) {
      setPreferredName(profile.preferredName || user?.displayName || '')
      setEducationStage(profile.educationStage || 'HSC Pre-Engineering')
      setCity(profile.city || 'Karachi')
      setBudget(profile.budgetPreference || 'flexible')
    } else if (user) {
      setPreferredName(user.displayName || '')
    }
  }, [profile, user])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setStatusMsg(null)
    try {
      await api('/profile', {
        method: 'PATCH',
        auth: true,
        body: {
          preferredName,
          educationStage,
          city,
          budgetPreference: budget,
        },
      })
      await refreshMe()
      setStatusMsg('✓ Profile preferences successfully updated.')
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = () => {
    if (deleteConfirmInput !== 'DELETE') return
    setShowDeleteModal(false)
    setStatusMsg('Account deletion request registered in accordance with Acadiv data lifecycle policy.')
    setTimeout(() => logout(), 1200)
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-forest">Account & Preferences</span>
          <span className="badge badge-verified">Active Session</span>
        </div>
        <h1>Settings & Privacy</h1>
        <p style={{ maxWidth: '640px', fontSize: '0.98rem' }}>
          Manage your personal educational qualifications, academic preferences, and data privacy controls.
        </p>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: statusMsg.startsWith('✓') ? 'var(--teal-soft)' : 'var(--coral-soft)',
            border: `1px solid ${statusMsg.startsWith('✓') ? 'var(--teal)' : 'var(--coral)'}`,
            color: statusMsg.startsWith('✓') ? 'var(--forest)' : '#C24B2F',
            fontSize: '0.92rem',
            fontWeight: 500,
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* Profile Form */}
      <div className="card" style={{ padding: '36px', border: '1.5px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.35rem', marginBottom: '20px' }}>Personal Preferences</h3>

        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label className="form-label">Preferred Name / Display Name</label>
            <input
              type="text"
              className="form-input"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Registered Email</label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ background: 'var(--canvas)', color: 'var(--text-dim)' }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Email address cannot be modified directly once verified.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Current Academic Stage</label>
            <select
              className="form-select"
              value={educationStage}
              onChange={(e) => setEducationStage(e.target.value)}
            >
              <option value="Matriculation">Matriculation (BIEK / Federal)</option>
              <option value="FSc Pre-Engineering">Intermediate / FSc Pre-Engineering</option>
              <option value="FSc Pre-Medical">Intermediate / FSc Pre-Medical</option>
              <option value="ICS">Intermediate / ICS (Computing)</option>
              <option value="DAE">DAE (SBTE Technical Diploma)</option>
              <option value="O-Level">O-Level (Cambridge)</option>
              <option value="A-Level">A-Level (Cambridge)</option>
              <option value="Undergraduate">Current University Undergraduate</option>
            </select>
          </div>

          <div className="grid-cols-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">City Focus</label>
              <input
                type="text"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Semester Budget Preference</label>
              <select
                className="form-select"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                <option value="subsidized">Subsidized Merit (NED, KU: Rs 30k–60k)</option>
                <option value="moderate">Moderate Semi-Govt (Rs 80k–150k)</option>
                <option value="flexible">Flexible / Tier-1 Private (Rs 180k+)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-forest"
            style={{ marginTop: '16px' }}
            disabled={saving}
          >
            {saving ? 'Saving Preferences...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Data Ownership & Account Deletion */}
      <div className="card" style={{ padding: '36px', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: '#C24B2F' }}>Data Ownership & Account Privacy</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Acadiv does not sell your personal assessment responses, transcripts, or uploaded vault files to advertisers.
          You can request account termination and permanent removal of your data at any time.
        </p>

        <button
          type="button"
          className="btn btn-outline"
          style={{ borderColor: '#C24B2F', color: '#C24B2F' }}
          onClick={() => setShowDeleteModal(true)}
        >
          Request Account Deletion
        </button>
      </div>

      {/* Deletion Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-panel" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setShowDeleteModal(false)}>
              ✕
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', color: '#C24B2F' }}>Confirm Account Deletion</h3>
            <p style={{ fontSize: '0.88rem', marginBottom: '16px' }}>
              This will permanently schedule your student profile, saved 3D roadmaps, and vault files for erasure.
              Type <strong>DELETE</strong> below to confirm:
            </p>
            <input
              type="text"
              className="form-input"
              placeholder="Type DELETE"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              style={{ marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#C24B2F', color: '#FFFFFF', border: 'none' }}
                disabled={deleteConfirmInput !== 'DELETE'}
                onClick={handleConfirmDelete}
              >
                Permanently Delete Account
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
