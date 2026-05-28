import { useState, useEffect } from 'react'
import { getEvents } from '../services/api'

function EventList({ onView, onEdit, onDelete, onInvites }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getEvents()
      setEvents(data || [])
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <p>Loading events...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <p>No events found. Create your first event!</p>
      </div>
    )
  }

  return (
    <div className="event-list-container">
      <h2>Events ({events.length})</h2>
      <div className="event-list">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-card-content">
              <h3 className="event-card-title">{event.title || 'Untitled Event'}</h3>
              {event.description && (
                <p className="event-card-description">{event.description}</p>
              )}
              {event.address && (
                <p className="event-card-address">{event.address}</p>
              )}
              {event.eventDateTime && (
                <p className="event-card-date">
                  {new Date(event.eventDateTime).toLocaleString()}
                </p>
              )}
            </div>
            <div className="event-card-actions">
              {onView && (
                <button
                  onClick={() => onView(event.id)}
                  className="action-button view-button"
                >
                  View
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(event.id)}
                  className="action-button edit-button"
                >
                  Edit
                </button>
              )}
              {onInvites && (
                <button
                  onClick={() => onInvites(event.id, event.title)}
                  className="action-button invites-button"
                >
                  Invites
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(event.id)}
                  className="action-button delete-button"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventList
