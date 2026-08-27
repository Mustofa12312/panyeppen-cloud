import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

import DashboardLayout from '../layouts/DashboardLayout'
import AuthLayout from '../layouts/AuthLayout'

import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Files from '../pages/Files'
import Folder from '../pages/Folder'
import Upload from '../pages/Upload'
import Search from '../pages/Search'
import Profile from '../pages/Profile'
import Shared from '../pages/Shared'
import Trash from '../pages/Trash'

/**
 * Protected Route — redirect ke /login jika belum auth
 */
function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#16a34a] border-t-transparent animate-spin-slow" />
          <p className="text-sm text-[#64748b] font-medium">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * Guest Route — redirect ke / jika sudah auth
 */
function GuestRoute({ children }) {
  const { isAuth, loading } = useAuth()

  if (loading) return null
  if (isAuth) return <Navigate to="/" replace />
  return children
}

export default function AppRoutes() {
  const { isAuth: user } = useAuth()

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      </Route>

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/files"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Files />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/folder/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Folder />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Upload />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Search />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shared"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Shared />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/trash"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Trash />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
