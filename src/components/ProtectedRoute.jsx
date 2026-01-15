import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // TODO: Remove this bypass when implementing proper authentication
  const BYPASS_AUTH = true; // Set to false when auth is implemented

  if (BYPASS_AUTH) {
    // Bypass mode: always allow access
    return children
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-state">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute

