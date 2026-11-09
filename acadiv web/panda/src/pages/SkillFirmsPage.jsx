import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { PinIcon, StarIcon, SearchIcon, CloseIcon, ArrowRightIcon, ExternalLinkIcon, RoadmapIcon } from '../components/icons/AcadivIcons'

export default function SkillFirmsPage() {
  const { activeCareer } = useAuth()
  const [firms, setFirms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDomain, setSelectedDomain] = useState('')
  const [filterByCareer, setFilterByCareer] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedFirm, setSelectedFirm] = useState(null)
  const [firmCourses, setFirmCourses] = useState([])
  const [firmCoursesLoading, setFirmCoursesLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        let path = '/skill-firms?limit=50'
        if (selectedDomain) {
          path += `&domain=${encodeURIComponent(selectedDomain)}`
        } else if (filterByCareer && activeCareer?.domain) {
          path += `&domain=${encodeURIComponent(activeCareer.domain)}`
        }
        if (search) path += `&q=${encodeURIComponent(search)}`

        const fRes = await api(path)
        setFirms(fRes.data || [])
      } catch (err) {
        console.error('Failed to load skill firms:', err)
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(loadData, 250)
    return () => clearTimeout(timer)
  }, [selectedDomain, filterByCareer, activeCareer?.domain, search])

  const handleOpenFirm = async (firm) => {
    setSelectedFirm(firm)
    setFirmCoursesLoading(true)
    try {
      const res = await api(`/skill-firms/${firm.slug || firm._id}`)
      setFirmCourses(res.data?.courses || [])
    } catch (err) {
      console.error('Failed to load firm courses:', err)
    } finally {
      setFirmCoursesLoading(false)
    }
  }

  // Jawan Pakistan is guaranteed #1 via database query { isFeatured: -1, featuredPriority: 1 }
  const featuredFirm = firms.find((f) => f.isFeatured)
  const otherFirms = firms.filter((f) => !f.isFeatured)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-forest">Editorial Spotlight</span>
          <span className="badge badge-verified">Verified Karachi Bootcamps</span>
        </div>
        <h1>Karachi Skill Bootcamps & Academies</h1>
        <p style={{ maxWidth: '720px', fontSize: '0.98rem' }}>
          Discover verified local tech bootcamps, subsidized software academies, and specialized vocational programmes.
          Every listed institution includes verified campus locations, published tuition status, and direct enrollment links.
        </p>
      </div>

      {/* Active Career Direction Banner */}
      {activeCareer && (
        <div
          className="card"
          style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, rgba(23, 75, 67, 0.08) 0%, rgba(52, 185, 165, 0.08) 100%)',
            border: '1.5px solid var(--teal)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--forest)',
                color: 'var(--lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <RoadmapIcon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Bootcamps Matched to Active Career
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)' }}>
                {activeCareer.title}{' '}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  ({activeCareer.domain || 'Professional Field'})
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className={`btn btn-sm ${filterByCareer ? 'btn-teal' : 'btn-outline'}`}
              onClick={() => {
                setFilterByCareer(!filterByCareer)
                setSelectedDomain('')
              }}
            >
              {filterByCareer ? 'Showing Career-Aligned Bootcamps' : 'Show Career-Specific Only'}
            </button>
            <Link to="/match" className="btn btn-outline btn-sm" style={{ fontSize: '0.82rem' }}>
              Change Direction →
            </Link>
          </div>
        </div>
      )}

      {/* Featured Editorial Placement: Jawan Pakistan */}
      {featuredFirm && (
        <section
          className="card"
          style={{
            padding: '40px 36px',
            background: 'linear-gradient(135deg, #174B43 0%, #0E2528 100%)',
            border: '2px solid var(--lime)',
            color: '#FBFAF6',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(199, 237, 105, 0.2)',
                color: '#C7ED69',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: '1px solid rgba(199, 237, 105, 0.4)',
              }}
            >
              <StarIcon size={13} />
              <span>{featuredFirm.featuredLabel || 'Acadiv Featured Placement'}</span>
            </span>
            <span style={{ fontSize: '0.88rem', color: '#C7ED69', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <PinIcon size={14} />
              <span>{featuredFirm.campusArea || 'Gulistan-e-Johar, Karachi'}</span>
            </span>
          </div>

          <h2 style={{ fontSize: '2.2rem', marginBottom: '12px', color: '#FBFAF6' }}>
            {featuredFirm.name}
          </h2>
          <p style={{ fontSize: '1.05rem', maxWidth: '820px', marginBottom: '22px', lineHeight: '1.65', color: '#DCE2D9' }}>
            {featuredFirm.description}
          </p>

          <div style={{ fontSize: '0.88rem', color: '#8E9E9F', marginBottom: '24px' }}>
            <strong style={{ color: '#FBFAF6' }}>Campus Location:</strong> {featuredFirm.karachiLocation}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
            {featuredFirm.skillDomains?.map((domain) => (
              <span
                key={domain}
                style={{
                  fontSize: '0.82rem',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FBFAF6',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                {domain}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-lime btn-md"
              onClick={() => handleOpenFirm(featuredFirm)}
            >
              View Verified Courses & Fees →
            </button>
            {featuredFirm.officialWebsite && (
              <a
                href={featuredFirm.officialWebsite}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-white btn-md"
              >
                Official Website ↗
              </a>
            )}
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '240px' }}>
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            placeholder="Search bootcamps: Jawan, Saylani, BanoQabil, PIAIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
        >
          <option value="">All Domains</option>
          <option value="Web Development">Web Development</option>
          <option value="Artificial Intelligence">AI & Machine Learning</option>
          <option value="Mobile App Development">Mobile App Dev</option>
          <option value="Graphic Design">UI/UX & Graphic Design</option>
          <option value="Cyber Security">Cybersecurity</option>
          <option value="Cloud Computing">Cloud Computing</option>
        </select>
      </div>

      {/* Other Verified Skill Firms Grid */}
      {loading ? (
        <div className="grid-cols-3" style={{ gap: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ height: '240px' }}>
              <div className="skeleton" style={{ height: '22px', width: '60%', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '70px', width: '100%', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '36px', width: '100%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-cols-3" style={{ gap: '22px' }}>
          {otherFirms.map((firm) => (
            <div
              key={firm._id}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-forest">
                    {firm.providerType || 'Skill Academy'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                    {firm.campusArea || 'Karachi'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px', color: 'var(--ink)' }}>
                  {firm.name}
                </h3>
                <p style={{ fontSize: '0.88rem', marginBottom: '16px', lineHeight: '1.55', color: 'var(--text-muted)' }}>
                  {firm.description?.length > 130 ? firm.description.slice(0, 127) + '…' : firm.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {firm.skillDomains?.slice(0, 3).map((d) => (
                    <span key={d} className="badge badge-subtle" style={{ fontSize: '0.75rem' }}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-forest btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleOpenFirm(firm)}
                >
                  View Details & Courses
                </button>
                {firm.officialWebsite && (
                  <a
                    href={firm.officialWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    Portal ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedFirm && (
        <div className="modal-backdrop" onClick={() => setSelectedFirm(null)}>
          <div className="modal-panel" style={{ maxWidth: '720px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelectedFirm(null)} aria-label="Close modal">
              <CloseIcon size={18} />
            </button>

            <span className="badge badge-forest" style={{ marginBottom: '8px' }}>
              {selectedFirm.providerType || 'Training Provider'} • {selectedFirm.campusArea || 'Karachi'}
            </span>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{selectedFirm.name}</h2>
            <p style={{ fontSize: '0.94rem', marginBottom: '20px', lineHeight: '1.6' }}>{selectedFirm.description}</p>

            <div style={{ padding: '14px 18px', background: 'var(--canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '24px', fontSize: '0.88rem' }}>
              <strong>Campus Location:</strong> {selectedFirm.karachiLocation || 'Karachi, Pakistan'}
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: '14px', color: 'var(--forest)' }}>
              Verified Courses & Programmes
            </h3>

            {firmCoursesLoading ? (
              <div className="skeleton" style={{ height: '140px', width: '100%', borderRadius: 'var(--radius-md)' }} />
            ) : firmCourses.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', background: 'var(--canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Current batch enrollment is confirmed via the official portal.
                </p>
                {selectedFirm.officialWebsite && (
                  <a
                    href={selectedFirm.officialWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-forest btn-sm"
                    style={{ marginTop: '12px' }}
                  >
                    Visit Official Enrollment Page ↗
                  </a>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {firmCourses.map((c) => (
                  <div key={c._id || c.title} style={{ padding: '16px 18px', background: 'var(--canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--forest)' }}>{c.title}</strong>
                      <span className="badge badge-verified">
                        {c.feeNote || (c.feeAmount === 0 ? 'Free / Subsidized' : `PKR ${c.feeAmount?.toLocaleString()}`)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{c.description}</p>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                      <span>Duration: {c.durationWeeks ? `${c.durationWeeks} Weeks` : 'Modular'}</span>
                      <span>Mode: {c.deliveryMode || 'Hybrid / On-Campus'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
