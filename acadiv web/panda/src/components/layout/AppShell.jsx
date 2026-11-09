import { useState, useEffect, useCallback } from 'react'
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AcadivLogo from '../brand/AcadivLogo'
import Footer from './Footer'
import {
  ExploreIcon,
  AssessmentIcon,
  MatchIcon,
  RoadmapIcon,
  SkillGapIcon,
  InstitutionsIcon,
  SkillFirmsIcon,
  BulletinIcon,
  VaultIcon,
  CommunityIcon,
  SettingsIcon,
  CollapseIcon,
  ExpandIcon,
  MenuIcon,
  CloseIcon,
  LogoutIcon,
  PortfolioIcon,
  SunIcon,
  MoonIcon,
} from '../icons/AcadivIcons'

// ============================================================
// Theme System — sets data-theme on <html>, persists to localStorage
// Respects OS preference on first visit; explicit choice takes priority
// ============================================================
function getInitialTheme() {
  try {
    const stored = localStorage.getItem('acadiv_theme')
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* ignore */
  }
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem('acadiv_theme', theme)
  } catch {
    /* ignore */
  }
}

export default function AppShell() {
  const { user, logout, activeCareer } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Sync theme changes dispatched from SettingsPage
  useEffect(() => {
    const handleThemeEvent = (e) => {
      if (e.detail?.theme) setTheme(e.detail.theme)
    }
    window.addEventListener('acadiv:theme-change', handleThemeEvent)
    return () => window.removeEventListener('acadiv:theme-change', handleThemeEvent)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  // Intelligent & Manual Sidebar Collapse State
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('acadiv_sidebar_collapsed') === 'true'
  })
  const [isManualOverride, setIsManualOverride] = useState(false)

  // Auto-collapse on scroll past header overview (only if user hasn't manually pinned)
  useEffect(() => {
    const handleScroll = () => {
      if (isManualOverride) return
      if (window.innerWidth < 1024) return

      const scrollThreshold = 380
      if (window.scrollY > scrollThreshold && !isCollapsed) {
        setIsCollapsed(true)
      } else if (window.scrollY <= 120 && isCollapsed) {
        setIsCollapsed(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isCollapsed, isManualOverride])

  const toggleManualCollapse = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    setIsManualOverride(true)
    localStorage.setItem('acadiv_sidebar_collapsed', String(nextState))
  }

  const navItems = [
    { to: '/explore', label: 'Explore Hub', icon: ExploreIcon },
    { to: '/assessment', label: 'RIASEC Test', icon: AssessmentIcon },
    { to: '/profile/match', label: 'Match Profile', icon: MatchIcon },
    { to: '/roadmap', label: '3D Roadmap', icon: RoadmapIcon },
    { to: '/skill-gap', label: 'Skill Gap', icon: SkillGapIcon },
    { to: '/institutions', label: 'Institutions', icon: InstitutionsIcon },
    { to: '/skills', label: 'Skill Bootcamps', icon: SkillFirmsIcon },
    { to: '/bulletin', label: 'Campus Bulletin', icon: BulletinIcon },
    { to: '/vault', label: 'Artifact Vault', icon: VaultIcon },
    { to: '/community', label: 'Community Hub', icon: CommunityIcon },
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className={`app-shell ${isCollapsed ? 'sidebar-compact' : ''}`}>
      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR NAVIGATION (EXPANDED OR COMPACT RAIL)         */}
      {/* ============================================================ */}
      <aside
        className={`app-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}
        style={{
          width: isCollapsed ? '76px' : '260px',
          transition: 'width 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), padding 0.28s ease',
        }}
      >
        {/* Sidebar Header with Brand + Manual Collapse Affordance */}
        <div
          style={{
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: '8px',
          }}
        >
          {isCollapsed ? (
            <AcadivLogo variant="symbol" size="sm" asLink to="/explore" />
          ) : (
            <AcadivLogo variant="full" size="md" surface="light" asLink to="/explore" />
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm collapse-toggle-btn"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              display: 'inline-flex',
            }}
            onClick={toggleManualCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse to compact rail'}
            aria-label={isCollapsed ? 'Expand navigation rail' : 'Collapse navigation rail'}
          >
            {isCollapsed ? <ExpandIcon size={18} /> : <CollapseIcon size={18} />}
          </button>
        </div>

        {/* Active Career Indicator — visible in expanded mode */}
        {!isCollapsed && activeCareer && (
          <div
            style={{
              margin: '12px 0 0',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--teal-soft)',
              border: '1px solid rgba(52, 185, 165, 0.25)',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
              Active Career
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--forest)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeCareer.title}
            </div>
            {activeCareer.compatibilityScore && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                {activeCareer.compatibilityScore}/100 Compatibility
              </div>
            )}
          </div>
        )}

        {/* Navigation List */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''} ${isCollapsed ? 'compact-link' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <span className="sidebar-icon-wrap" style={{ flexShrink: 0 }}>
                  <Icon size={19} />
                </span>
                {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar User Card & Theme Toggle & Exit */}
        <div
          style={{
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Theme Toggle Button */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '8px',
              padding: '8px 10px',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              width: '100%',
            }}
          >
            {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
            {!isCollapsed && (
              <span style={{ fontSize: '0.84rem', fontWeight: 500 }}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          {/* User & Logout */}
          {isCollapsed ? (
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              style={{ padding: '8px', color: 'var(--text-muted)', justifyContent: 'center' }}
              title={`Sign out (${user?.displayName})`}
            >
              <LogoutIcon size={18} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
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
                style={{ padding: '4px 8px', fontSize: '0.78rem', flexShrink: 0 }}
                title="Logout"
              >
                Exit
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN APPLICATION CONTAINER                                   */}
      {/* ============================================================ */}
      <div className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm mobile-menu-toggle"
              style={{ display: 'inline-flex' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
              <span style={{ marginLeft: '4px' }}>{mobileMenuOpen ? 'Close' : 'Menu'}</span>
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {activeCareer ? (
                <>
                  <span style={{ color: 'var(--text-dim)' }}>Pursuing:</span>{' '}
                  <span style={{ color: 'var(--forest)', fontWeight: 700 }}>{activeCareer.title}</span>
                </>
              ) : (
                'Karachi Student Portal'
              )}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme toggle in topbar (mobile-friendly shortcut) */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              aria-label="Toggle theme"
              style={{ padding: '7px', color: 'var(--text-muted)' }}
            >
              {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
            </button>

            <Link to="/vault" className="btn btn-outline btn-sm">
              <VaultIcon size={15} /> Vault
            </Link>
            <Link to="/portfolio/me" className="btn btn-teal btn-sm">
              <PortfolioIcon size={15} /> My Portfolio
            </Link>
          </div>
        </header>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div
            className="mobile-nav-drawer"
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
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={toggleTheme}
              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleLogout}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
            >
              <LogoutIcon size={16} /> Logout ({user?.displayName})
            </button>
          </div>
        )}

        {/* Dynamic Route Content */}
        <main className="app-content">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer showMotif={false} />
      </div>
    </div>
  )
}
