import { useState, useEffect } from 'react'
import { getEventAttendance, deleteAttendee } from '../services/api'

function AttendeeList({ eventId, isAdmin = false, onAttendeeRemoved }) {
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingKey, setRemovingKey] = useState(null)

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

  const handleRemove = async (attendee) => {
    const key = `${attendee.source}-${attendee.id}`
    if (!window.confirm(`Remove ${attendee.name} from the attendance list?`)) return
    try {
      setRemovingKey(key)
      await deleteAttendee(eventId, attendee.source, attendee.id)
      setAttendees(prev => prev.filter(a => `${a.source}-${a.id}` !== key))
      // Let the parent refresh the event so a removed "Yes" frees a capacity spot.
      if (onAttendeeRemoved) onAttendeeRemoved()
    } catch (err) {
      console.error('Error removing attendee:', err)
      alert('Failed to remove attendee. Please try again.')
    } finally {
      setRemovingKey(null)
    }
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

  // Display order: Attending → Maybe → Not Attending → Tentative (no response yet).
  const statusRank = (response) => {
    switch (response) {
      case 'Yes':
        return 0
      case 'Maybe':
        return 1
      case 'No':
        return 2
      default:
        return 3 // Tentative — hasn't responded
    }
  }

  // Sort a copy (never mutate state): by status group, then alphabetically by name.
  const sortedAttendees = [...attendees].sort((a, b) => {
    const rankDiff = statusRank(a.response) - statusRank(b.response)
    if (rankDiff !== 0) return rankDiff
    return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
  })

  return (
    <section className="attendee-list-section">
      <h2>Attendees ({attendees.length})</h2>
      <div className="attendee-table-container">
        <table className="attendee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Attendance Status</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {sortedAttendees.map((attendee) => {
              const key = `${attendee.source}-${attendee.id}`
              return (
                <tr key={key}>
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
                  {isAdmin && (
                    <td className="attendee-actions-cell">
                      <button
                        className="attendee-remove-button"
                        onClick={() => handleRemove(attendee)}
                        disabled={removingKey === key}
                      >
                        {removingKey === key ? 'Removing…' : 'Remove'}
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AttendeeList
