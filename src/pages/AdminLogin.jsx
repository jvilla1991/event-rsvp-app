import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { login as apiLogin } from '../services/api'
import '../App.css'
import './AdminLogin.css'

function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // TODO: Remove this bypass when implementing proper authentication
    const BYPASS_AUTH = true; // Set to false when auth is implemented

    if (BYPASS_AUTH) {
      // Bypass mode: auto-login and redirect
      login('dev-bypass-token')
      navigate('/admin/dashboard')
      return
    }

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password')
      return
    }

    try {
      setLoading(true)
      const response = await apiLogin(username, password)
      
      if (response.token) {
        login(response.token)
        navigate('/admin/dashboard')
      } else {
        setError('Invalid response from server')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h1>Admin Login</h1>
          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
                placeholder="Enter username"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="Enter password"
                disabled={loading}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

