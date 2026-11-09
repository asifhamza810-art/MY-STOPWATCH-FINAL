import { useState } from 'react'
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AcadivLogo from '../brand/AcadivLogo'
import Footer from './Footer'

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { to: '/explore', label: 'Explore Hub', icon: '🧭' },
    { to: '/assessment', label: 'RIASEC Test', icon: '🎯' },
    { to: '/profile/match', label: 'Match Profile', icon: '📊' },
    { to: '/roadmap', label: '3D Roadmap', icon: '🗺️' },
    { to: '/skill-gap', label: 'Skill Gap', icon: '⚖️' },
    { to: '/institutions', label: 'Institutions', icon: '🏛️' },
    { to: '/skills', label: 'Skill Firms', icon: '⚡' },
    { to: '/bulletin', label: 'Bulletin', icon: '📅' },
    { to: '/vault', label: 'Artifact Vault', icon: '📁' },
    { to: '/community', label: 'Community', icon: '💬' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR NAVIGATION */}
      {/* ============================================================ */}
      <aside className="app-sidebar">
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <AcadivLogo variant="full" size="md" surface="light" asLink to="/explore" />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.15rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout in Sidebar Footer */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--teal-soft)',
                  border: '1.5px solid var(--teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: 'var(--forest)',
                  fontSize: '0.85rem',
                  flexShrink: 0,
                }}
              >
                {user?.displayName ? user.displayName[0].toUpperCase() : 'S'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.displayName || 'Student'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                  {user?.role || 'student'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              style={{ padding: '4px 8px', fontSize: '0.78rem' }}
              title="Logout"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN APPLICATION CONTAINER */}
      {/* ============================================================ */}
      <div className="app-main">
        {/* Topbar for mobile toggle and quick actions */}
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? '✕ Close' : '☰ Menu'}
            </button>
            <div style={{ display: 'none' }} className="mobile-logo-show">
              <AcadivLogo variant="symbol" size="sm" />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Karachi Student Portal
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/vault" className="btn btn-outline btn-sm">
              📁 Vault
            </Link>
            <Link to="/portfolio/me" className="btn btn-teal btn-sm">
              View Portfolio
            </Link>
          </div>
        </header>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleLogout}
              style={{ width: '100%' }}
            >
              Logout ({user?.displayName})
            </button>
          </div>
        )}

        {/* Dynamic Route Content */}
        <main className="app-content">
          <Outlet />
        </main>

        {/* Provenance & Source Integrity Footer */}
        <Footer />
      </div>
    </div>
  )
}

