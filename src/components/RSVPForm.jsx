import { useState, useEffect } from 'react'
import { submitRSVP } from '../services/api'
import ProposeTimeModal from './ProposeTimeModal'

function RSVPForm({ eventId, onRSVPSuccess, allowTimeProposal = false, initialName = '' }) {
  const [name, setName] = useState(initialName)

  // Sync when initialName arrives asynchronously (e.g. ?invite= token resolved after mount)
  useEffect(() => {
    if (initialName) setName(initialName)
  }, [initialName])
  const [willAttend, setWillAttend] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const doSubmit = async (rsvpData) => {
    try {
      setLoading(true)
      await submitRSVP(eventId, rsvpData)
      setSuccess(true)
      setName('')
      setWillAttend(true)
      if (onRSVPSuccess) onRSVPSuccess()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error submitting RSVP:', err)
      setError(err.response?.data?.message || 'Failed to submit RSVP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!eventId || isNaN(parseInt(eventId))) {
      setError('Event ID is missing or invalid. Please refresh the page and try again.')
      return
    }

    if (!willAttend && allowTimeProposal) {
      // Intercept — show modal to propose a time or decline
      setShowModal(true)
      return
    }

    await doSubmit({ name: name.trim(), willAttend: willAttend })
  }

  const handlePropose = async (proposedTime) => {
    setShowModal(false)
    await doSubmit({ name: name.trim(), willAttend: false, proposedTime })
  }

  const handleDecline = async () => {
    setShowModal(false)
    await doSubmit({ name: name.trim(), willAttend: false, proposedTime: null })
  }

  const isFormValid = name.trim()

  return (
    <section className="rsvp-form-section">
      <h2>RSVP Here</h2>
      <form onSubmit={handleSubmit} className="rsvp-form">
        <div className="form-group">
          <label htmlFor="name">Your Name <span className="required-star">*</span></label>
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

        <div className="form-group">
          <label className="radio-group-label">Will you attend? <span className="required-star">*</span></label>
          <div className="radio-group">
            <label className={`radio-label radio-yes ${willAttend ? 'radio-selected' : ''}`}>
              <input
                type="radio"
                name="attendance"
                value="yes"
                checked={willAttend === true}
                onChange={() => setWillAttend(true)}
              />
              Yes
            </label>
            <label className={`radio-label radio-no ${!willAttend ? 'radio-selected' : ''}`}>
              <input
                type="radio"
                name="attendance"
                value="no"
                checked={willAttend === false}
                onChange={() => setWillAttend(false)}
              />
              No
            </label>
          </div>
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

      {showModal && (
        <ProposeTimeModal
          name={name.trim()}
          onPropose={handlePropose}
          onDecline={handleDecline}
        />
      )}
    </section>
  )
}

export default RSVPForm
