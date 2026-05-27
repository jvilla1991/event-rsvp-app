import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { viewInvite } from '../services/api'

function InvitePage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleInvite = async () => {
      if (!token) {
        setError('Invalid invite link.')
        return
      }
      try {
        const invite = await viewInvite(token)
        // Replace history so the back button goes to the event, not back to /invite/:token
        navigate(`/event/${invite.eventId}`, { replace: true })
      } catch {
        setError('This invite link is invalid or no longer exists.')
      }
    }
    handleInvite()
  }, [token, navigate])

  if (error) {
    return (
      <div className="app">
        <div className="invite-error-state">
          <p className="invite-error-icon">🔗</p>
          <p className="invite-error-title">Invalid Invite Link</p>
          <p className="invite-error-message">{error}</p>
          <button className="invite-error-button" onClick={() => navigate('/')}>
            View All Events
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="invite-loading-state">
        <p className="invite-loading-icon">✉️</p>
        <p className="invite-loading-text">Opening your invite...</p>
      </div>
    </div>
  )
}

export default InvitePage
