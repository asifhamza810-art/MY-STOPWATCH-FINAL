import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '80px auto', padding: '24px' }}>
        <div className="skeleton" style={{ height: '36px', width: '280px', marginBottom: '20px' }} />
        <div className="skeleton" style={{ height: '160px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
      </div>
    )
  }

  if (!user) {
    // Preserve intended destination so user returns immediately after sign in
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

