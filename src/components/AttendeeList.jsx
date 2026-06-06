import { useState, useEffect } from 'react'
import { getEventAttendance } from '../services/api'

function AttendeeList({ eventId }) {
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAttendance = async () => {
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
        const data = await getEventAttendance(parsedEventId)
        // Only show people we can name (skip anonymous invites with no name).
        setAttendees((data || []).filter(a => a.name && a.name.trim()))
      } catch (err) {
        console.error('Error fetching attendance:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
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

  if (attendees.length === 0) {
    return (
      <section className="attendee-list-section">
        <h2>Attendees</h2>
        <div className="empty-state">
          <p>No attendees yet. Be the first to RSVP!</p>
        </div>
      </section>
    )
  }

  // An invited person who hasn't responded yet has no recorded response.
  const renderStatus = (response) => {
    switch (response) {
      case 'Yes':
        return <span className="attendance-yes">Attending</span>
      case 'Maybe':
        return <span className="attendance-maybe">Maybe</span>
      case 'No':
        return <span className="attendance-no">Not Attending</span>
      default:
        return <span className="attendance-tentative">Tentative</span>
    }
  }

  return (
    <section className="attendee-list-section">
      <h2>Attendees ({attendees.length})</h2>
      <div className="attendee-table-container">
        <table className="attendee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Attendance Status</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((attendee) => (
              <tr key={`${attendee.source}-${attendee.id}`}>
                <td className="attendee-name-cell">
                  {attendee.name}
                  {attendee.response && attendee.response !== 'Yes' && attendee.proposedTime && (
                    <div className="proposed-time-note">
                      Suggests: {new Date(attendee.proposedTime).toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="attendance-status-cell">
                  {renderStatus(attendee.response)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AttendeeList
