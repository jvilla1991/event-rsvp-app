import { useState, useEffect } from 'react'
import { getEventRSVPs } from '../services/api'

function AttendeeList({ eventId }) {
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRSVPs = async () => {
      if (!eventId) {
        setLoading(false)
        return
      }

      // Validate eventId is a valid number
      const parsedEventId = parseInt(eventId)
      if (isNaN(parsedEventId)) {
        setError('Invalid event ID.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const data = await getEventRSVPs(parsedEventId)
        setRsvps(data || [])
      } catch (err) {
        console.error('Error fetching RSVPs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRSVPs()
    
    // Refresh RSVPs every 5 seconds to show new submissions
    const interval = setInterval(fetchRSVPs, 5000)
    return () => clearInterval(interval)
  }, [eventId])

  if (loading) {
    return (
      <section className="attendee-list-section">
        <h2>Attendees</h2>
        <div className="loading-state">
          <p>Loading attendees...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="attendee-list-section">
        <h2>Attendees</h2>
        <div className="error-state">
          <p>{error}</p>
        </div>
      </section>
    )
  }

  if (rsvps.length === 0) {
    return (
      <section className="attendee-list-section">
        <h2>Attendees</h2>
        <div className="empty-state">
          <p>No RSVPs yet. Be the first to RSVP!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="attendee-list-section">
      <h2>Attendees ({rsvps.length})</h2>
      <div className="attendee-list">
        {rsvps.map((rsvp) => (
          <div key={rsvp.id} className="attendee-card">
            <div className="attendee-name">{rsvp.name}</div>
            <div className="attendance-status">
              {rsvp.willAttend ? (
                <span className="attendance-yes">✓ Will attend</span>
              ) : (
                <span className="attendance-no">✗ Will not attend</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default AttendeeList

