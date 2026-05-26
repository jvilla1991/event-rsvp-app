import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    setIsAuthenticated(!!token)
    setLoading(false)

    // Listen for logout events from API interceptor (401 errors)
    const handleLogout = () => {
      setIsAuthenticated(false)
    }
    
    window.addEventListener('auth:logout', handleLogout)
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout)
    }
  }, [])

  const login = (token) => {
    localStorage.setItem('authToken', token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setIsAuthenticated(false)
  }

  const value = {
    isAuthenticated,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

