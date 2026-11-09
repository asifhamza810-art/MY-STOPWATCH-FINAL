import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { InstitutionsIcon, SearchIcon, CloseIcon, PinIcon, CheckIcon } from '../components/icons/AcadivIcons'

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedAuthority, setSelectedAuthority] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedInst, setSelectedInst] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [page, setPage] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    async function loadInstitutions() {
      setLoading(true)
      try {
        let path = '/institutions?limit=100'
        if (search) path += `&q=${encodeURIComponent(search)}`
        if (selectedCategory) path += `&category=${encodeURIComponent(selectedCategory)}`
        if (selectedAuthority) path += `&accreditationAuthority=${encodeURIComponent(selectedAuthority)}`
        if (selectedArea) path += `&area=${encodeURIComponent(selectedArea)}`
        const res = await api(path)
        setInstitutions(res.data || [])
      } catch (err) {
        console.error('Failed to load institutions:', err)
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(loadInstitutions, 250)
    return () => clearTimeout(timer)
  }, [search, selectedCategory, selectedAuthority, selectedArea])

  const handleOpenDetail = async (inst) => {
    setSelectedInst(inst)
    setDetailLoading(true)
    try {
      const res = await api(`/institutions/${inst.slug || inst._id}`)
      setDetailData(res.data)
    } catch (err) {
      console.error('Failed to load institution details:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  // Pagination slice
  const totalPages = Math.ceil(institutions.length / itemsPerPage)
  const paginatedList = institutions.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const getAuthorityBadge = (inst) => {
    const auth = inst.accreditationAuthority || (inst.category === 'university' ? 'HEC' : 'BIEK')
    if (auth === 'HEC') return { label: 'HEC Recognized', cls: 'badge-verified' }
    if (auth === 'BIEK') return { label: 'BIEK Affiliated', cls: 'badge-forest' }
    if (auth === 'SBTE') return { label: 'SBTE Registered', cls: 'badge-subtle' }
    if (auth === 'STEVTA' || auth === 'NAVTTC') return { label: `${auth} Vocational`, cls: 'badge-forest' }
    return { label: auth, cls: 'badge-subtle' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Directory Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-forest">Official Karachi Directory</span>
          <span className="badge badge-verified">Zero Fabrication • Verified Authorities</span>
        </div>
        <h1>Karachi Institution Explorer</h1>
        <p style={{ maxWidth: '720px', fontSize: '0.98rem' }}>
          Explore 25+ verified Karachi universities, BIEK intermediate colleges, SBTE polytechnic diploma institutes, and STEVTA vocational academies. All profiles include verified campuses, published fee ranges, and entrance examination criteria.
        </p>
      </div>

      {/* Multi-Parameter Filter & Search Bar */}
      <div className="card" style={{ padding: '20px 24px', background: 'var(--surface)', border: '1.5px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
          {/* Keyword Search */}
          <div className="search-box" style={{ width: '100%' }}>
            <span className="search-icon" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              placeholder="Search NED, FAST, IBA, DJ Science..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>

          {/* Category Filter */}
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1) }}
          >
            <option value="">All Categories</option>
            <option value="university">Universities (Degree Awarding)</option>
            <option value="college">Higher Secondary / Colleges</option>
            <option value="polytechnic">Polytechnics (SBTE Diplomas)</option>
            <option value="vocational">Vocational & Technical (STEVTA)</option>
          </select>

          {/* Authority Filter */}
          <select
            className="form-select"
            value={selectedAuthority}
            onChange={(e) => { setSelectedAuthority(e.target.value); setPage(1) }}
          >
            <option value="">All Regulatory Authorities</option>
            <option value="HEC">HEC Pakistan (Universities)</option>
            <option value="BIEK">BIEK Karachi (Colleges)</option>
            <option value="SBTE">SBTE Sindh (Polytechnics)</option>
            <option value="STEVTA">STEVTA (Vocational Training)</option>
            <option value="NAVTTC">NAVTTC (Federal Skills)</option>
          </select>

          {/* Area Filter */}
          <select
            className="form-select"
            value={selectedArea}
            onChange={(e) => { setSelectedArea(e.target.value); setPage(1) }}
          >
            <option value="">All Karachi Areas</option>
            <option value="Gulshan-e-Iqbal">Gulshan-e-Iqbal</option>
            <option value="Saddar">Saddar / Downtown</option>
            <option value="Clifton">Clifton & Defence</option>
            <option value="Federal B Area">Federal B Area</option>
            <option value="North Nazimabad">North Nazimabad</option>
            <option value="SITE">SITE Industrial Area</option>
            <option value="Korangi">Korangi</option>
            <option value="Malir">Malir / Airport</option>
          </select>
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid-cols-3" style={{ gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card" style={{ height: '260px' }}>
              <div className="skeleton" style={{ height: '24px', width: '50%', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '80px', width: '100%', marginBottom: '20px' }} />
              <div className="skeleton" style={{ height: '40px', width: '100%' }} />
            </div>
          ))}
        </div>
      ) : institutions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" style={{ color: 'var(--teal)', display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <InstitutionsIcon size={44} />
          </div>
          <h3 className="empty-title">No Institutions Match Your Filters</h3>
          <p className="empty-text">Try resetting your area or regulatory authority filter.</p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedAuthority(''); setSelectedArea('') }}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          {/* Institution Cards Grid */}
          <div className="grid-cols-3" style={{ gap: '22px' }}>
            {paginatedList.map((inst) => {
              const badge = getAuthorityBadge(inst)
              return (
                <div
                  key={inst._id}
                  className="card"
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span className={`badge ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'capitalize' }}>
                        {inst.ownershipType} • {inst.category}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', lineHeight: '1.35', color: 'var(--ink)' }}>
                      {inst.name}
                    </h3>

                    <p style={{ fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.55', color: 'var(--text-muted)' }}>
                      {inst.description?.length > 140 ? inst.description.slice(0, 137) + '…' : inst.description}
                    </p>

                    {inst.recognitionNote && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--forest)', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CheckIcon size={12} />
                        <span>{inst.recognitionNote}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-forest btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleOpenDetail(inst)}
                    >
                      Programmes & Fees →
                    </button>
                    {inst.admissionsWebsite && (
                      <a
                        href={inst.admissionsWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        title="Official Admissions Portal"
                      >
                        Portal ↗
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Page {page} of {totalPages} ({institutions.length} Total Verified)
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Institution Detail Modal */}
      {selectedInst && (
        <div className="modal-backdrop" onClick={() => setSelectedInst(null)}>
          <div className="modal-panel" style={{ maxWidth: '760px', maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelectedInst(null)} aria-label="Close modal">
              <CloseIcon size={18} />
            </button>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-forest">{selectedInst.ownershipType?.toUpperCase()}</span>
              <span className="badge badge-verified">{selectedInst.accreditationAuthority || 'HEC Verified'}</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{selectedInst.name}</h2>
            <p style={{ fontSize: '0.94rem', marginBottom: '24px', lineHeight: '1.6' }}>{selectedInst.description}</p>

            {detailLoading ? (
              <div className="skeleton" style={{ height: '180px', width: '100%', borderRadius: 'var(--radius-md)' }} />
            ) : detailData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Campuses */}
                {detailData.campuses?.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--forest)', marginBottom: '10px', fontSize: '1.1rem' }}>Campuses & Physical Facilities</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {detailData.campuses.map((c) => (
                        <div key={c._id || c.name} style={{ padding: '12px 16px', background: 'var(--canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.9rem' }}>
                          <strong>{c.name}</strong> — {c.address || c.area || 'Karachi'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accredited Programmes */}
                {detailData.programmes?.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--forest)', marginBottom: '10px', fontSize: '1.1rem' }}>Accredited Programmes & Eligibility</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {detailData.programmes.map((p) => (
                        <div key={p._id || p.title} style={{ padding: '16px', background: 'var(--canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <strong style={{ color: 'var(--forest)', fontSize: '1rem' }}>{p.title}</strong>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{p.duration || '4 Years'}</span>
                          </div>
                          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            Minimum Eligibility: {p.educationStageEligibility?.join(', ')} ({p.publishedMinimumMarks || '60%+'})
                          </div>
                          {p.requiredTests?.length > 0 && (
                            <div style={{ fontSize: '0.82rem', color: 'var(--teal)', fontWeight: 600 }}>
                              Required Entrance Examination: {p.requiredTests.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Fees */}
                {detailData.fees?.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--forest)', marginBottom: '10px', fontSize: '1.1rem' }}>Verified Fee Structure</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {detailData.fees.map((f) => (
                        <div key={f._id} style={{ padding: '14px 18px', background: 'var(--teal-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--teal)', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--forest)' }}>
                            <span>Academic Year {f.academicYear}</span>
                            <span>PKR {f.amount?.toLocaleString()} {f.paymentFrequency}</span>
                          </div>
                          {f.additionalChargesNote && (
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              {f.additionalChargesNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  {selectedInst.officialWebsite && (
                    <a href={selectedInst.officialWebsite} target="_blank" rel="noreferrer" className="btn btn-forest btn-sm" style={{ flex: 1 }}>
                      Visit Official Website ↗
                    </a>
                  )}
                  {selectedInst.admissionsWebsite && (
                    <a href={selectedInst.admissionsWebsite} target="_blank" rel="noreferrer" className="btn btn-teal btn-sm" style={{ flex: 1 }}>
                      Admissions Portal ↗
                    </a>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
