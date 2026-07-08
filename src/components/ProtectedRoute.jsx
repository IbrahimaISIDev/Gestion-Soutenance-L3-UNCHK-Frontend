import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!user) return <Navigate to="/login" replace />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/non-autorise" replace />
  }

  return <Outlet />
}
