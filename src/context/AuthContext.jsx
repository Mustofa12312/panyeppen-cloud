import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCurrentUser, isAuthenticated, login, logout, refreshUser } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session saat app dibuka
  useEffect(() => {
    const restoreSession = async () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser()
        setUser(currentUser)
        // Refresh quota di background
        refreshUser().then((updated) => {
          if (updated) setUser(updated)
        })
      }
      setLoading(false)
    }
    restoreSession()
  }, [])

  const handleLogin = useCallback(async (username, password) => {
    const result = await login(username, password)
    setUser(result.user)
    return result
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
  }, [])

  const value = {
    user,
    loading,
    isAuth: !!user,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
