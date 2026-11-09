import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthModal from '../ui/AuthModal'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const navigate = useNavigate()

  const links = [
    { to: '/', label: 'Explore' },
    { to: '/assessment', label: 'RIASEC Assessment' },
    { to: '/roadmap', label: '3D Roadmap' },
    { to: '/institutions', label: 'Institutions' },
    { to: '/skills', label: 'Skill Firms' },
    { to: '/bulletin', label: 'Bulletin' },
    { to: '/community', label: 'Community' },
    { to: '/vault', label: 'Vault' },
  ]

  return (
    <>
      <header className="navbar-wrapper">
        <div className="navbar">
          <Link to="/" className="nav-brand" onClick={() => setMobileOpen(false)}>
            <div className="brand-dot" />
            <span>ACADIV</span>
            <span className="brand-badge">Pakistan</span>
          </Link>

          <nav className="nav-links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/settings"
                  className="btn btn-secondary btn-sm"
                  title="Settings & Profile"
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  {user.displayName?.split(' ')[0] || 'Student'}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-outline btn-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                >
                  Sign In
                </button>
                <Link to="/onboarding" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </div>
            )}

            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mobile-menu">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
            <NavLink
              to="/skill-gap"
              onClick={() => setMobileOpen(false)}
              className="mobile-nav-link"
            >
              Skill-Gap Analysis
            </NavLink>
            <NavLink
              to="/profile/match"
              onClick={() => setMobileOpen(false)}
              className="mobile-nav-link"
            >
              Diagnostic Profile
            </NavLink>
            {user ? (
              <NavLink
                to="/settings"
                onClick={() => setMobileOpen(false)}
                className="mobile-nav-link"
              >
                Settings & Account
              </NavLink>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  setAuthModalOpen(true)
                }}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '8px', width: '100%' }}
              >
                Sign In / Register
              </button>
            )}
          </div>
        )}
      </header>

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </>
  )
}

