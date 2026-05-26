import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import RSVPForm from '../components/RSVPForm'
import AttendeeList from '../components/AttendeeList'
import PollDisplay from '../components/PollDisplay'
import { getEvent } from '../services/api'

function PublicEventPage() {
  const { eventId: eventIdParam } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [eventId, setEventId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAttendees, setShowAttendees] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventIdParam) {
        setError('Event ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        
        // Validate eventId is a valid number
        const parsedEventId = parseInt(eventIdParam)
        if (isNaN(parsedEventId)) {
          setError('Invalid event ID. Please select an event from the list.')
          setLoading(false)
          return
        }
        
        const eventData = await getEvent(parsedEventId)
        setEventId(parsedEventId)
        setEvent(eventData)
      } catch (err) {
        console.error('Error fetching event:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventIdParam])

  const handleRSVPSuccess = () => {
    // RSVP was submitted successfully, AttendeeList will refresh automatically
  }

  const getGoogleMapsUrl = (address) => {
    if (!address) return '#'
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-state">
          <p>Loading event...</p>
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

  if (!event) {
    return (
      <div className="app">
        <div className="error-state">
          <p>No event found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title-row">
          <button
            onClick={() => navigate('/')}
            className="view-all-events-button"
          >
            ← View All Events
          </button>
          <h1>{event.title || 'Event RSVP'}</h1>
        </div>
        {event.description && (
          <p className="subtitle">{event.description}</p>
        )}
        {event.eventDateTime && (
          <p className="event-date">
            {new Date(event.eventDateTime).toLocaleString()}
          </p>
        )}
        {event.address && (
          <div className="event-address">
            <p className="address-label">Event Location:</p>
            <a 
              href={getGoogleMapsUrl(event.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="address-link"
            >
              <span className="address-text">📍 {event.address}</span>
              <span className="address-hint">Click to open in Google Maps →</span>
            </a>
          </div>
        )}
      </header>
      
      <main className="app-main">
        <RSVPForm eventId={eventId} onRSVPSuccess={handleRSVPSuccess} />
        <PollDisplay eventId={eventId} />
        <div className="attendees-toggle-section">
          <button
            onClick={() => setShowAttendees(!showAttendees)}
            className="toggle-attendees-button"
          >
            {showAttendees ? 'Hide' : 'Show'} Attendees
          </button>
          {showAttendees && <AttendeeList eventId={eventId} />}
        </div>
      </main>
    </div>
  )
}

export default PublicEventPage

