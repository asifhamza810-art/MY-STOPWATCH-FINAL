import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { CalendarIcon, InstitutionsIcon, SearchIcon, ExternalLinkIcon } from '../components/icons/AcadivIcons'

export default function CampusBulletinPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  useEffect(() => {
    async function loadEvents() {
      setLoading(true)
      try {
        let path = '/events?limit=50'
        if (category) path += `&category=${encodeURIComponent(category)}`
        if (search) path += `&q=${encodeURIComponent(search)}`
        const res = await api(path)
        setEvents(res.data || [])
      } catch (err) {
        console.error('Failed to load bulletin events:', err)
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(loadEvents, 250)
    return () => clearTimeout(timer)
  }, [category, search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-forest">Karachi Campus Wire</span>
            <span className="badge badge-verified">Zero-Chat • Curated Events</span>
          </div>
          <h1>Campus Opportunity Bulletin</h1>
          <p style={{ maxWidth: '680px', fontSize: '0.98rem' }}>
            Verified inter-university competitions, hackathons, academic MUNs, research symposiums, and engineering expos across Karachi campuses.
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'inline-flex', background: 'var(--surface-alt)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-forest' : 'btn-ghost'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'list' ? 'btn-forest' : 'btn-ghost'}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '240px' }}>
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            placeholder="Search Procom, IBAMUN, Sentec, Speed Programming..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Event Categories</option>
          <option value="hackathon">Hackathons & Coding</option>
          <option value="mun">Model UN & Diplomacy</option>
          <option value="workshop">Technical Workshops</option>
          <option value="exhibition">Expos & Project Showcases</option>
          <option value="competition">Engineering Competitions</option>
        </select>
      </div>

      {/* Events Presentation */}
      {loading ? (
        <div className="grid-cols-2" style={{ gap: '20px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ height: '220px' }}>
              <div className="skeleton" style={{ height: '24px', width: '50%', marginBottom: '14px' }} />
              <div className="skeleton" style={{ height: '60px', width: '100%', marginBottom: '14px' }} />
              <div className="skeleton" style={{ height: '36px', width: '100%' }} />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" style={{ color: 'var(--teal)', display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <CalendarIcon size={44} />
          </div>
          <h3 className="empty-title">No Active Campus Events</h3>
          <p className="empty-text">
            Events automatically expire after their registration deadline passes to keep student opportunity listings current and actionable.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid-cols-2" style={{ gap: '24px' }}>
          {events.map((ev) => {
            const startDate = ev.startsAt ? new Date(ev.startsAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'
            const deadline = ev.registrationDeadline ? new Date(ev.registrationDeadline).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Open'

            return (
              <div
                key={ev._id}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span className="badge badge-forest">{ev.category?.toUpperCase()}</span>
                    <span className="badge badge-verified">
                      {ev.format?.toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', marginBottom: '10px', color: 'var(--ink)' }}>
                    {ev.title}
                  </h3>

                  <div style={{ fontSize: '0.88rem', color: 'var(--teal)', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <InstitutionsIcon size={15} />
                    <span>Host: {ev.institutionName || ev.organizer || 'Karachi Campus'}</span>
                  </div>

                  <p style={{ fontSize: '0.92rem', marginBottom: '18px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                    {ev.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px', background: 'var(--canvas)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '20px', fontSize: '0.84rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-dim)' }}>Event Date</div>
                      <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{startDate}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-dim)' }}>Registration Deadline</div>
                      <div style={{ fontWeight: 700, color: 'var(--forest)' }}>{deadline}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)' }}>
                    {ev.feeNote || 'Registration Open'}
                  </span>
                  {ev.registrationLink && (
                    <a
                      href={ev.registrationLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-forest btn-sm"
                    >
                      Official Register ↗
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.map((ev) => {
            const startDate = ev.startsAt ? new Date(ev.startsAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : 'TBD'
            const deadline = ev.registrationDeadline ? new Date(ev.registrationDeadline).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : 'Open'

            return (
              <div
                key={ev._id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px', flex: 1 }}>
                  <div style={{ padding: '8px 12px', background: 'var(--teal-soft)', borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: '70px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Date</div>
                    <div style={{ fontWeight: 800, color: 'var(--forest)', fontSize: '0.95rem' }}>{startDate}</div>
                  </div>
                  <div>
                    <span className="badge badge-subtle" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>{ev.category}</span>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>{ev.title}</h4>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{ev.institutionName} • Deadline: {deadline}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-verified">{ev.format?.toUpperCase()}</span>
                  {ev.registrationLink && (
                    <a href={ev.registrationLink} target="_blank" rel="noreferrer" className="btn btn-forest btn-sm">
                      Register ↗
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
