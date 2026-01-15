import { useState } from 'react'
import { submitRSVP } from '../services/api'

function RSVPForm({ eventId, onRSVPSuccess }) {
  const [name, setName] = useState('')
  const [willAttend, setWillAttend] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!eventId) {
      setError('Event ID is missing. Please refresh the page and try again.')
      return
    }
    
    // Validate eventId is a valid number
    if (isNaN(parseInt(eventId))) {
      setError('Invalid event ID. Please select an event from the list.')
      return
    }

    try {
      setLoading(true)
      const rsvpData = {
        name: name.trim(),
        willAttend: willAttend
      }

      await submitRSVP(eventId, rsvpData)
      
      setSuccess(true)
      setName('')
      setWillAttend(true)
      
      if (onRSVPSuccess) {
        onRSVPSuccess()
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error submitting RSVP:', err)
        setError(err.response?.data?.message || 'Failed to submit RSVP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = name.trim()

  return (
    <section className="rsvp-form-section">
      <h2>RSVP Here</h2>
      <form onSubmit={handleSubmit} className="rsvp-form">
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            onFocus={() => setError('')}
            placeholder="Enter your name"
            className="name-input"
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={willAttend}
              onChange={(e) => setWillAttend(e.target.checked)}
              className="dish-checkbox"
            />
            <span>I will attend</span>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">RSVP submitted successfully!</div>}

        <button 
          type="submit" 
          className="submit-button"
          disabled={!isFormValid || loading}
        >
          {loading ? 'Submitting...' : 'Submit RSVP'}
        </button>
      </form>
    </section>
  )
}

export default RSVPForm

