import { useState, useEffect } from 'react'
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
} from '../icons/AcadivIcons'

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Intelligent & Manual Sidebar Collapse State
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('acadiv_sidebar_collapsed') === 'true'
  })
  const [isManualOverride, setIsManualOverride] = useState(false)

  // Auto-collapse on scroll past header overview (only if user hasn't manually pinned)
  useEffect(() => {
    const handleScroll = () => {
      if (isManualOverride) return
      if (window.innerWidth < 1024) return // Mobile handled via drawer

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

          {/* Elegant Minus / Collapse / Expand Control */}
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
            title={isCollapsed ? 'Expand sidebar (Ctrl + B)' : 'Collapse to compact rail'}
            aria-label={isCollapsed ? 'Expand navigation rail' : 'Collapse navigation rail'}
          >
            {isCollapsed ? <ExpandIcon size={18} /> : <CollapseIcon size={18} />}
          </button>
        </div>

        {/* Navigation List with Tooltips in Compact Mode */}
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

        {/* Sidebar User Card & Exit Action */}
        <div
          style={{
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
          }}
        >
          {isCollapsed ? (
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              style={{ padding: '8px', color: 'var(--text-muted)' }}
              title={`Sign out (${user?.displayName})`}
            >
              <LogoutIcon size={18} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
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
              Karachi Student Portal
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

        {/* Provenance & Source Integrity Footer with Organic Crumble Motif */}
        <Footer showMotif={false} />
      </div>
    </div>
  )
}
