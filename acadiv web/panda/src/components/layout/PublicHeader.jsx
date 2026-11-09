import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AcadivLogo from '../brand/AcadivLogo'

export default function PublicHeader() {
  const { user } = useAuth()

  return (
    <header
      className="public-header"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1360px',
        margin: '0 auto',
      }}
    >
      {/* Acadiv Brand Logo (No Pakistan badge, clean wayfinder symbol) */}
      <AcadivLogo variant="full" size="md" surface="dark" asLink to="/" />

      {/* ONLY TWO PRIMARY ACTIONS - No dashboard/feature links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {user ? (
          <Link to="/explore" className="btn btn-lime btn-sm">
            Go to Student Dashboard →
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline-white btn-sm">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-lime btn-sm">
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  )
}

