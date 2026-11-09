import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const w = (rel, content) => {
  const p = path.join(root, rel)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, content)
  console.log('wrote', rel)
}

w(
  'src/styles/tokens.css',
  `:root {
  --midnight: #0A1128;
  --midnight-2: #0B132B;
  --charcoal: #1C2541;
  --mist: #F4F6F9;
  --ice: #EBF3FA;
  --border: #D8E2EC;
  --ocean: #0284C7;
  --ocean-deep: #0077B6;
  --amber: #C59B27;
  --text: #D8E2EC;
  --text-strong: #F4F6F9;
  --muted: #9BB0C3;
  --surface: rgba(28, 37, 65, 0.72);
  --surface-solid: #121a33;
  --radius: 14px;
  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Sora", system-ui, sans-serif;
  --shadow: 0 18px 50px rgba(2, 12, 32, 0.35);
}
`
)

w(
  'src/components/ui/Button.jsx',
  `export default function Button({ children, variant = 'primary', className = '', as: As = 'button', ...props }) {
  return (
    <As className={\`btn btn-\${variant} \${className}\`.trim()} {...props}>
      {children}
    </As>
  )
}
`
)

w(
  'src/components/ui/Card.jsx',
  `export default function Card({ children, className = '' }) {
  return <div className={\`card \${className}\`.trim()}>{children}</div>
}
`
)

w(
  'src/components/ui/Badge.jsx',
  `export default function Badge({ children, tone = 'ocean' }) {
  return <span className={\`badge badge-\${tone}\`}>{children}</span>
}
`
)

w(
  'src/components/ui/EmptyState.jsx',
  `export default function EmptyState({ title, body, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {body ? <p>{body}</p> : null}
      {action}
    </div>
  )
}
`
)

w(
  'src/components/ui/PageHeader.jsx',
  `export default function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <header className="page-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {subtitle ? <p className="lede">{subtitle}</p> : null}
    </header>
  )
}
`
)

w(
  'src/components/fluid/MotionSection.jsx',
  `import { motion, useReducedMotion } from 'motion/react'

export default function MotionSection({ children, className = '' }) {
  const reduce = useReducedMotion()
  return (
    <motion.section
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}
`
)

w(
  'src/components/layout/Seo.jsx',
  `import { useEffect } from 'react'

export default function Seo({ title, description }) {
  useEffect(() => {
    document.title = title ? \`\${title} · Acadiv\` : 'Acadiv'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    if (description) meta.content = description
  }, [title, description])
  return null
}
`
)

w(
  'src/components/layout/Navbar.jsx',
  `import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

const links = [
  ['/', 'Home'],
  ['/institutions', 'Institutions'],
  ['/skills', 'Skills'],
  ['/bulletin', 'Bulletin'],
  ['/roadmap', 'Roadmap'],
  ['/community', 'Community'],
]

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">Acadiv</Link>
        <nav className="nav-links" aria-label="Primary">
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/settings">{user.displayName}</Link>
              <Button variant="ghost" type="button" onClick={logout}>Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Button as={Link} to="/onboarding" variant="primary">Start</Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
`
)

w(
  'src/components/layout/Footer.jsx',
  `import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <strong className="brand">Acadiv</strong>
          <p>Evidence-based career navigation for Pakistani students — starting with Karachi.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/institutions">Institutions</Link>
          <Link to="/skills">Skill firms</Link>
          <Link to="/bulletin">Campus bulletin</Link>
        </div>
        <div>
          <h4>Journey</h4>
          <Link to="/onboarding">Onboarding</Link>
          <Link to="/assessment">Assessment</Link>
          <Link to="/roadmap">Roadmap</Link>
        </div>
        <div>
          <h4>Trust</h4>
          <p>No invented fees, rankings, or success rates. Sources and last-checked dates stay visible.</p>
        </div>
      </div>
      <p className="footer-note">© {new Date().getFullYear()} Acadiv</p>
    </footer>
  )
}
`
)

w(
  'src/components/layout/AppShell.jsx',
  `import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function AppShell() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
`
)

console.log('layout+ui done')
