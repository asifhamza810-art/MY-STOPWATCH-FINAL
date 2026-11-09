import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { FolderIcon, FileTextIcon, TrashIcon, CloseIcon, UploadIcon, LinkIcon, CheckIcon } from '../components/icons/AcadivIcons'

export default function ArtifactVaultPage() {
  const { user } = useAuth()
  const [artifacts, setArtifacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // New artifact form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('project')
  const [projectUrl, setProjectUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const loadArtifacts = async () => {
    setLoading(true)
    try {
      let path = '/artifacts'
      if (selectedCategory) path += `?category=${encodeURIComponent(selectedCategory)}`
      const res = await api(path, { auth: true })
      setArtifacts(res.data || [])
    } catch (err) {
      console.error('Failed to load artifacts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArtifacts()
  }, [selectedCategory])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setStatusMsg(null)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)
      if (projectUrl) formData.append('projectUrl', projectUrl)
      if (selectedFile) formData.append('file', selectedFile)

      await api('/artifacts', {
        method: 'POST',
        auth: true,
        formData,
      })

      setShowAddModal(false)
      setTitle('')
      setDescription('')
      setProjectUrl('')
      setSelectedFile(null)
      setStatusMsg('Artifact successfully added to your Evidence Vault.')
      await loadArtifacts()
    } catch (err) {
      setStatusMsg(`Upload error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api(`/artifacts/${id}`, { method: 'DELETE', auth: true })
      setDeleteConfirmId(null)
      setStatusMsg('Artifact removed from your vault.')
      await loadArtifacts()
    } catch (err) {
      setStatusMsg(`Delete error: ${err.message}`)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
      if (!title) {
        setTitle(e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-forest">Verifiable Student Evidence</span>
            <span className="badge badge-verified">Proof of Competency</span>
          </div>
          <h1>Student Artifact Vault</h1>
          <p style={{ maxWidth: '680px', fontSize: '0.98rem' }}>
            A secure workspace for your verifiable academic and technical artifacts: GitHub repositories, research papers, design portfolios, and course certificates.
          </p>
        </div>

        <button type="button" className="btn btn-forest" onClick={() => setShowAddModal(true)}>
          + Upload Evidence / Link Repo
        </button>
      </div>

      {statusMsg && (
        <div style={{ padding: '12px 18px', borderRadius: 'var(--radius-md)', background: 'var(--teal-soft)', border: '1px solid var(--teal)', color: 'var(--forest)', fontSize: '0.92rem' }}>
          {statusMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-bar" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink)' }}>Category:</span>
        {[
          { id: '', label: 'All Artifacts' },
          { id: 'project', label: 'Projects & Code' },
          { id: 'certificate', label: 'Course Certificates' },
          { id: 'research', label: 'Research & Papers' },
          { id: 'design', label: 'Design & Figma' },
          { id: 'writing', label: 'Writing & Essays' },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            className={`btn btn-sm ${selectedCategory === c.id ? 'btn-forest' : 'btn-outline'}`}
            onClick={() => setSelectedCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Artifacts Grid */}
      {loading ? (
        <div className="grid-cols-3" style={{ gap: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: '220px' }}>
              <div className="skeleton" style={{ height: '22px', width: '60%', marginBottom: '14px' }} />
              <div className="skeleton" style={{ height: '70px', width: '100%', marginBottom: '14px' }} />
              <div className="skeleton" style={{ height: '36px', width: '100%' }} />
            </div>
          ))}
        </div>
      ) : artifacts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" style={{ color: 'var(--teal)', display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <FolderIcon size={44} />
          </div>
          <h3 className="empty-title">No Artifacts in This Category</h3>
          <p className="empty-text">
            Upload your first code repository, research report, or training certificate to build evidence for university admissions and employers.
          </p>
          <button type="button" className="btn btn-forest btn-sm" onClick={() => setShowAddModal(true)}>
            Upload First Artifact
          </button>
        </div>
      ) : (
        <div className="grid-cols-3" style={{ gap: '22px' }}>
          {artifacts.map((art) => (
            <div
              key={art._id}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '28px',
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-forest">{art.category?.toUpperCase()}</span>
                  <span className="badge badge-subtle" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    {art.projectUrl ? (
                      <>
                        <LinkIcon size={12} />
                        <span>Repo Linked</span>
                      </>
                    ) : (
                      <>
                        <FileTextIcon size={12} />
                        <span>File Uploaded</span>
                      </>
                    )}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--ink)' }}>
                  {art.title}
                </h3>
                <p style={{ fontSize: '0.88rem', marginBottom: '16px', lineHeight: '1.55', color: 'var(--text-muted)' }}>
                  {art.description}
                </p>

                {art.projectUrl && (
                  <div style={{ marginBottom: '14px' }}>
                    <a
                      href={art.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.85rem', color: 'var(--teal)', fontWeight: 600 }}
                    >
                      View Linked URL ↗
                    </a>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  {new Date(art.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#C24B2F', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setDeleteConfirmId(art._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Artifact Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-panel" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setShowAddModal(false)} aria-label="Close modal">
              <CloseIcon size={18} />
            </button>

            <span className="badge badge-forest" style={{ marginBottom: '8px' }}>Evidence Repository</span>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Add Verifiable Artifact</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '22px', lineHeight: '1.5' }}>
              Upload code bundles, PDF reports, or link public GitHub repositories. Artifacts can be embedded into your shareable student portfolio.
            </p>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Artifact Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Karachi Hospital Bed Tracker / Full-Stack MERN"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="project">Project / Application Code</option>
                  <option value="certificate">Training Certificate (e.g. Jawan / Coursera)</option>
                  <option value="research">Academic Paper / Research Report</option>
                  <option value="design">UI/UX Design / Figma System</option>
                  <option value="writing">Technical Article / Publication</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Repository / Project URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/your-username/your-repo"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                />
              </div>

              {/* Drag & Drop File Target */}
              <div className="form-group">
                <label className="form-label">Supporting Document / File (Optional)</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  style={{
                    padding: '24px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px dashed ${isDragging ? 'var(--teal)' : 'var(--border)'}`,
                    background: isDragging ? 'var(--teal-soft)' : 'var(--canvas)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => document.getElementById('vault-file-input')?.click()}
                >
                  <div style={{ color: 'var(--teal)', display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <UploadIcon size={32} />
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--ink)' }}>
                    {selectedFile ? selectedFile.name : 'Drag & drop file here or click to browse'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    PDF, PNG, JPG, or ZIP up to 10MB
                  </div>
                  <input
                    id="vault-file-input"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0])
                        if (!title) setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''))
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description & Role</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Briefly describe what this project does, technologies used, and your personal contribution."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-forest" disabled={submitting}>
                  {submitting ? 'Uploading Evidence...' : 'Save to Vault'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-panel" style={{ maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ color: '#C24B2F', display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <TrashIcon size={36} />
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Delete Artifact?</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
              Are you sure you want to permanently remove this evidence item from your Vault?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#C24B2F', color: '#FFFFFF', border: 'none' }}
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Confirm Delete
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
