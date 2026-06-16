import { useState, useEffect } from 'react'
import { submitRSVP } from '../services/api'
import { getRememberedName, rememberName } from '../utils/rememberedName'
import ProposeTimeModal from './ProposeTimeModal'
import AddToCalendarDrawer from './AddToCalendarDrawer'

function RSVPForm({ eventId, event, onRSVPSuccess, allowTimeProposal = false, initialName = '' }) {
  // Pre-fill from an invite link if present, otherwise from a name this device
  // remembered from a previous RSVP. The invite name always wins.
  const [name, setName] = useState(initialName || getRememberedName())

  // Sync when initialName arrives asynchronously (e.g. ?invite= token resolved after mount)
  useEffect(() => {
    if (initialName) setName(initialName)
  }, [initialName])
  const [status, setStatus] = useState('Yes')
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  // Set after a successful "Yes" so we can offer an add-to-calendar option. Unlike the
  // 3-second success toast, this persists so the user has time to tap it.
  const [calendarEvent, setCalendarEvent] = useState(null)

  const doSubmit = async (rsvpData) => {
    try {
      setLoading(true)
      await submitRSVP(eventId, rsvpData)
      // Remember this name on the device so future events pre-fill it.
      rememberName(rsvpData.name)
      setSuccess(true)
      setName('')
      setStatus('Yes')
      // Only offer the calendar on a "Yes" (check rsvpData, not the state we just reset).
      if (rsvpData.status === 'Yes' && event?.eventDateTime) {
        setCalendarEvent(event)
      }
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
    setCalendarEvent(null)

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!eventId || isNaN(parseInt(eventId))) {
      setError('Event ID is missing or invalid. Please refresh the page and try again.')
      return
    }

    // "No" and "Maybe" can optionally suggest an alternative time when the event allows it.
    if (status !== 'Yes' && allowTimeProposal) {
      setShowModal(true)
      return
    }

    await doSubmit({ name: name.trim(), status })
  }

  // Keep the response the user picked (No or Maybe) and attach the suggested time.
  const handlePropose = async (proposedTime) => {
    setShowModal(false)
    await doSubmit({ name: name.trim(), status, proposedTime })
  }

  // Declining from the modal always records a definite "No".
  const handleDecline = async () => {
    setShowModal(false)
    await doSubmit({ name: name.trim(), status: 'No', proposedTime: null })
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
            <label className={`radio-label radio-yes ${status === 'Yes' ? 'radio-selected' : ''}`}>
              <input
                type="radio"
                name="attendance"
                value="Yes"
                checked={status === 'Yes'}
                onChange={() => setStatus('Yes')}
              />
              Yes
            </label>
            <label className={`radio-label radio-maybe ${status === 'Maybe' ? 'radio-selected' : ''}`}>
              <input
                type="radio"
                name="attendance"
                value="Maybe"
                checked={status === 'Maybe'}
                onChange={() => setStatus('Maybe')}
              />
              Maybe
            </label>
            <label className={`radio-label radio-no ${status === 'No' ? 'radio-selected' : ''}`}>
              <input
                type="radio"
                name="attendance"
                value="No"
                checked={status === 'No'}
                onChange={() => setStatus('No')}
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
          title={status === 'Maybe'
            ? `Not sure yet${name.trim() ? `, ${name.trim()}` : ''}?`
            : undefined}
          subtitle={status === 'Maybe'
            ? 'Want to suggest a time that might work better for you?'
            : undefined}
          showDecline={status !== 'Maybe'}
          onPropose={handlePropose}
          onDecline={handleDecline}
        />
      )}

      {calendarEvent && (
        <AddToCalendarDrawer
          event={calendarEvent}
          onClose={() => setCalendarEvent(null)}
        />
      )}
    </section>
  )
}

export default RSVPForm
