import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function ExploreHubPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [featuredFirm, setFeaturedFirm] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHubData() {
      try {
        const [instRes, firmsRes, eventsRes, careersRes] = await Promise.all([
          api('/institutions?limit=100'),
          api('/skill-firms'),
          api('/events?limit=4'),
          api('/careers'),
        ])

        setStats({
          institutions: instRes.data ? instRes.data.length : 0,
          firms: firmsRes.data ? firmsRes.data.length : 0,
          events: eventsRes.data ? eventsRes.data.length : 0,
          careers: careersRes.data ? careersRes.data.length : 0,
        })

        if (firmsRes.data?.length) {
          setFeaturedFirm(firmsRes.data[0]) // Jawan Pakistan is sorted #1
        }
        setEvents(eventsRes.data || [])
      } catch (err) {
        console.error('Failed to load explorer hub data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadHubData()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          padding: '40px 36px',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%)',
          border: '1.5px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-forest" style={{ marginBottom: '8px' }}>
              Student Workspace
            </span>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
              Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}
            </h1>
            <p style={{ maxWidth: '640px', fontSize: '1.02rem', lineHeight: '1.6' }}>
              Track verified Karachi college admissions, explore accredited engineering and medical faculties, and construct your milestone roadmap.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/assessment" className="btn btn-forest">
              🎯 Take RIASEC Test
            </Link>
            <Link to="/roadmap" className="btn btn-outline">
              🗺️ 3D Roadmap
            </Link>
          </div>
        </div>

        {/* Live Aggregates from real API responses */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginTop: '32px',
          }}
        >
          <div style={{ padding: '18px 22px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--forest)', fontFamily: 'var(--font-display)' }}>
              {loading ? '…' : stats?.institutions}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Verified Karachi Institutions</div>
          </div>

          <div style={{ padding: '18px 22px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--teal)', fontFamily: 'var(--font-display)' }}>
              {loading ? '…' : stats?.firms}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Verified Skill Firms</div>
          </div>

          <div style={{ padding: '18px 22px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--coral)', fontFamily: 'var(--font-display)' }}>
              {loading ? '…' : stats?.events}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Campus Opportunities</div>
          </div>

          <div style={{ padding: '18px 22px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--violet)', fontFamily: 'var(--font-display)' }}>
              {loading ? '…' : stats?.careers}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Documented Career Paths</div>
          </div>
        </div>
      </div>

      {/* Navigation Quick Access Grid */}
      <div>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '18px' }}>Platform Navigation</h2>
        <div className="grid-cols-3" style={{ gap: '20px' }}>
          <Link to="/assessment" className="card" style={{ padding: '28px', border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '14px' }}>🎯</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>RIASEC Assessment</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.55' }}>
              Adaptive diagnostic engine scored across 6 Holland dimensions with auditable reason traces.
            </p>
          </Link>

          <Link to="/roadmap" className="card" style={{ padding: '28px', border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '14px' }}>🗺️</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>3D Career Navigator</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.55' }}>
              Interactive WebGL pathway canvas modeling multi-year timelines, prerequisites, and Karachi entry exams.
            </p>
          </Link>

          <Link to="/institutions" className="card" style={{ padding: '28px', border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '14px' }}>🏛️</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Karachi Institutions</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.55' }}>
              Broad directory spanning NED, IBA, FAST, KU, DJ Science, Adamjee College, and STEVTA polytechnics.
            </p>
          </Link>

          <Link to="/skills" className="card" style={{ padding: '28px', border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '14px' }}>⚡</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Skill Bootcamps</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.55' }}>
              Jawan Pakistan featured training in Web and AI, alongside Saylani, BanoQabil, and GIAIC.
            </p>
          </Link>

          <Link to="/bulletin" className="card" style={{ padding: '28px', border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '14px' }}>📅</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Campus Bulletin</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.55' }}>
              Zero-chat event discovery for hackathons, declamations, MUNs, and student exhibitions.
            </p>
          </Link>

          <Link to="/vault" className="card" style={{ padding: '28px', border: '1.5px solid var(--border)' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '14px' }}>📁</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Artifact Vault</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.55' }}>
              Secure evidence workspace for GitHub links, research, certificates, and ATS CV generation.
            </p>
          </Link>
        </div>
      </div>

      {/* Featured Jawan Pakistan Spotlight */}
      {featuredFirm && (
        <div
          className="card"
          style={{
            padding: '36px',
            background: 'linear-gradient(135deg, #174B43 0%, #0E2528 100%)',
            border: '2px solid var(--lime)',
            color: '#FBFAF6',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
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
              ★ Featured Spotlight
            </span>
            <span style={{ fontSize: '0.85rem', color: '#C7ED69' }}>
              📍 {featuredFirm.campusArea || 'Gulistan-e-Johar, Karachi'}
            </span>
          </div>

          <h3 style={{ fontSize: '1.8rem', marginBottom: '8px', color: '#FBFAF6' }}>{featuredFirm.name}</h3>
          <p style={{ fontSize: '0.95rem', maxWidth: '780px', marginBottom: '20px', color: '#DCE2D9', lineHeight: '1.6' }}>
            {featuredFirm.description}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/skills" className="btn btn-lime btn-sm">
              Explore Courses & Bootcamps →
            </Link>
            {featuredFirm.officialWebsite && (
              <a
                href={featuredFirm.officialWebsite}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-white btn-sm"
              >
                Official Website ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Campus Bulletin Highlights */}
      {events.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.6rem' }}>Upcoming Opportunities</h2>
            <Link to="/bulletin" className="btn btn-outline btn-sm">
              View All Bulletin Events →
            </Link>
          </div>

          <div className="grid-cols-2" style={{ gap: '20px' }}>
            {events.map((ev) => (
              <div key={ev._id} className="card" style={{ padding: '24px', border: '1.5px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="badge badge-forest">{ev.category?.toUpperCase()}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                    {ev.format?.toUpperCase()}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{ev.title}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--teal)', fontWeight: 600, marginBottom: '8px' }}>
                  Host: {ev.institutionName}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px' }}>{ev.description}</p>
                {ev.registrationLink && (
                  <a href={ev.registrationLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    Register ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
