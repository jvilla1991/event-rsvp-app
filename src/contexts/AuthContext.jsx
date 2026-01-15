import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // TODO: Remove this bypass when implementing proper authentication
  const BYPASS_AUTH = true; // Set to false when auth is implemented
  
  const [isAuthenticated, setIsAuthenticated] = useState(BYPASS_AUTH)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (BYPASS_AUTH) {
      // Bypass mode: always authenticated
      setIsAuthenticated(true)
      setLoading(false)
      return
    }
    
    // Normal mode: Check if token exists in localStorage on mount
    const token = localStorage.getItem('authToken')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  const login = (token) => {
    if (BYPASS_AUTH) {
      setIsAuthenticated(true)
      return
    }
    localStorage.setItem('authToken', token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    if (BYPASS_AUTH) {
      // In bypass mode, logout just clears token but stays "authenticated"
      localStorage.removeItem('authToken')
      return
    }
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

