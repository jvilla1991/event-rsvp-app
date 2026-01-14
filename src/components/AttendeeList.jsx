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

      try {
        setLoading(true)
        setError('')
        const data = await getEventRSVPs(eventId)
        setRsvps(data || [])
      } catch (err) {
        console.error('Error fetching RSVPs:', err)
        setError('Failed to load attendees. Please try again later.')
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
            <div className="dish-status">
              {rsvp.bringingDish ? (
                <div className="dish-info">
                  {(() => {
                    const dishList = Array.isArray(rsvp.dishes) 
                      ? rsvp.dishes 
                      : (rsvp.dishes ? JSON.parse(rsvp.dishes) : [])
                    const dishCount = dishList.length
                    return (
                      <>
                        <span className="dish-yes">✓ Bringing {dishCount > 0 ? `${dishCount} dish${dishCount > 1 ? 'es' : ''}` : 'a dish'}</span>
                        {dishCount > 0 && (
                          <div className="dishes-list">
                            {dishList.map((dish, index) => (
                              <span key={index} className="dish-name">{dish}</span>
                            ))}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              ) : (
                <span className="dish-no">Not bringing a dish</span>
              )}
            </div>
            {rsvp.whiteElephant && (
              <div className="white-elephant-status">
                <span className="white-elephant-yes">🎁 Participating in white elephant</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default AttendeeList

