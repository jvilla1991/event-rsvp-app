import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEvents } from '../services/api'

function EventSelection() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'card' or 'table'
  const navigate = useNavigate()

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

  const handleEventSelect = (eventId) => {
    navigate(`/event/${eventId}`)
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-state">
          <p>Loading events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="app">
        <div className="error-state">
          <p>No events available at this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header event-selection-header">
        <h1>Select an Event</h1>
        <p className="subtitle">Choose an event to RSVP</p>
      </header>
      <main className="app-main">
        <div className="event-selection-container">
          <div className="view-toggle-container">
            <button
              onClick={() => setViewMode('table')}
              className={`view-toggle-button ${viewMode === 'table' ? 'active' : ''}`}
              title="Table View"
            >
              ☰
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`view-toggle-button ${viewMode === 'card' ? 'active' : ''}`}
              title="Card View"
            >
              ▢
            </button>
          </div>
          
          {viewMode === 'table' ? (
            <div className="event-selection-table-container">
              <table className="event-selection-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Date & Time</th>
                    <th>Address</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} onClick={() => handleEventSelect(event.id)}>
                      <td className="event-table-title">{event.title || 'Untitled Event'}</td>
                      <td className="event-table-description">{event.description || '-'}</td>
                      <td className="event-table-date">
                        {event.eventDateTime ? new Date(event.eventDateTime).toLocaleString() : '-'}
                      </td>
                      <td className="event-table-address">{event.address || '-'}</td>
                      <td className="event-table-action">
                        <button 
                          className="event-selection-button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEventSelect(event.id)
                          }}
                        >
                          RSVP Now →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="event-selection-grid">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="event-selection-card"
                  onClick={() => handleEventSelect(event.id)}
                >
                  <h3 className="event-selection-title">{event.title || 'Untitled Event'}</h3>
                  {event.description && (
                    <p className="event-selection-description">{event.description}</p>
                  )}
                  {event.address && (
                    <p className="event-selection-address">{event.address}</p>
                  )}
                  {event.eventDateTime && (
                    <p className="event-selection-date">
                      {new Date(event.eventDateTime).toLocaleString()}
                    </p>
                  )}
                  <button className="event-selection-button">RSVP Now →</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default EventSelection

