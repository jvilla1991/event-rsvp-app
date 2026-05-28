import { useState, useEffect } from 'react'
import { getEventPolls, createPoll, updatePoll, deletePoll } from '../services/api'
import PollForm from './PollForm'

function EventForm({ event, onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [eventDateTime, setEventDateTime] = useState('')
  const [description, setDescription] = useState('')
  const [allowTimeProposal, setAllowTimeProposal] = useState(false)
  const [error, setError] = useState('')
  const [polls, setPolls] = useState([])
  const [newPolls, setNewPolls] = useState([]) // For polls created before event is saved
  const [showPollForm, setShowPollForm] = useState(false)
  const [editingPoll, setEditingPoll] = useState(null)
  const [editingPollIndex, setEditingPollIndex] = useState(null) // For editing new polls
  const [loadingPolls, setLoadingPolls] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title || '')
      setAddress(event.address || '')
      setDescription(event.description || '')
      setAllowTimeProposal(event.allowTimeProposal ?? false)
      if (event.eventDateTime) {
        // Format datetime for input (YYYY-MM-DDTHH:mm)
        const date = new Date(event.eventDateTime)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        setEventDateTime(`${year}-${month}-${day}T${hours}:${minutes}`)
      } else {
        setEventDateTime('')
      }
      if (event.id) {
        fetchPolls(event.id)
      }
    } else {
      // Reset form for new event
      setTitle('')
      setAddress('')
      setEventDateTime('')
      setDescription('')
      setAllowTimeProposal(false)
      setPolls([])
      setNewPolls([])
    }
    setError('')
    setShowPollForm(false)
    setEditingPoll(null)
    setEditingPollIndex(null)
  }, [event])

  const fetchPolls = async (eventId) => {
    try {
      setLoadingPolls(true)
      const data = await getEventPolls(eventId)
      setPolls(data || [])
    } catch (err) {
      console.error('Error fetching polls:', err)
      // Don't show error for new events that don't have polls yet
      if (event?.id) {
        setPolls([])
      }
    } finally {
      setLoadingPolls(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Event title is required')
      return
    }

    const eventData = {
      title: title.trim(),
      address: address.trim() || null,
      description: description.trim() || null,
      eventDateTime: eventDateTime ? new Date(eventDateTime).toISOString() : null,
      allowTimeProposal,
    }

    // If creating new event with polls, pass polls data to be created after event
    if (!event && newPolls.length > 0) {
      eventData.polls = newPolls
    }

    onSubmit(eventData)
  }

  const handleCreatePoll = () => {
    if (showPollForm && !editingPoll) {
      // If form is open and we're not editing, close it
      setShowPollForm(false)
    } else {
      // Open form for creating new poll
      setEditingPoll(null)
      setEditingPollIndex(null)
      setShowPollForm(true)
    }
  }

  const handleEditPoll = (poll, index = null) => {
    setEditingPoll(poll)
    setEditingPollIndex(index)
    setShowPollForm(true)
  }

  const handleDeletePoll = async (pollId, index = null) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return
    }

    // If it's a new poll (has index), remove from newPolls
    if (index !== null) {
      setNewPolls(prev => prev.filter((_, i) => i !== index))
      return
    }

    // Otherwise, it's an existing poll - delete from server
    if (!event?.id) {
      return
    }

    try {
      setLoadingPolls(true)
      await deletePoll(event.id, pollId)
      await fetchPolls(event.id)
    } catch (err) {
      console.error('Error deleting poll:', err)
      alert('Failed to delete poll. Please try again.')
    } finally {
      setLoadingPolls(false)
    }
  }

  const handlePollFormSubmit = async (pollData) => {
    // If editing a new poll (before event is saved)
    if (editingPollIndex !== null) {
      const updatedPolls = [...newPolls]
      updatedPolls[editingPollIndex] = pollData
      setNewPolls(updatedPolls)
      setShowPollForm(false)
      setEditingPoll(null)
      setEditingPollIndex(null)
      return
    }

    // If creating a new poll (before event is saved)
    if (!event?.id) {
      setNewPolls(prev => [...prev, pollData])
      setShowPollForm(false)
      setEditingPoll(null)
      setEditingPollIndex(null)
      return
    }

    // Otherwise, it's an existing event - save to server
    try {
      setLoadingPolls(true)
      if (editingPoll) {
        await updatePoll(event.id, editingPoll.id, pollData)
      } else {
        await createPoll(event.id, pollData)
      }
      setShowPollForm(false)
      setEditingPoll(null)
      setEditingPollIndex(null)
      await fetchPolls(event.id)
    } catch (err) {
      console.error('Error saving poll:', err)
      alert(err.response?.data?.message || 'Failed to save poll. Please try again.')
    } finally {
      setLoadingPolls(false)
    }
  }

  const handlePollFormCancel = () => {
    setShowPollForm(false)
    setEditingPoll(null)
    setEditingPollIndex(null)
  }

  return (
    <div className="event-form-container">
      <h2>{event ? 'Edit Event' : 'Create New Event'}</h2>
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="title">Event Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setError('')
            }}
            placeholder="Enter event title"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setError('')
            }}
            placeholder="Enter event description"
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              setError('')
            }}
            placeholder="Enter event address"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventDateTime">Date & Time (15-minute increments)</label>
          <input
            type="datetime-local"
            id="eventDateTime"
            value={eventDateTime}
            onChange={(e) => {
              const value = e.target.value
              if (value) {
                // Round to nearest 15-minute increment
                const date = new Date(value)
                const minutes = date.getMinutes()
                const roundedMinutes = Math.round(minutes / 15) * 15
                date.setMinutes(roundedMinutes)
                date.setSeconds(0)
                date.setMilliseconds(0)
                
                // Format back to datetime-local format (YYYY-MM-DDTHH:mm)
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                const hours = String(date.getHours()).padStart(2, '0')
                const roundedMins = String(roundedMinutes).padStart(2, '0')
                const roundedValue = `${year}-${month}-${day}T${hours}:${roundedMins}`
                
                setEventDateTime(roundedValue)
              } else {
                setEventDateTime('')
              }
              setError('')
            }}
            step="900"
            disabled={loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={allowTimeProposal}
              onChange={(e) => setAllowTimeProposal(e.target.checked)}
              className="toggle-checkbox"
              disabled={loading}
            />
            <span className="toggle-text">
              Allow attendees to propose an alternative time when declining
            </span>
          </label>
          <p className="toggle-hint">
            When enabled, attendees who select "No" will be prompted with a modal to suggest a new time.
          </p>
        </div>

        {/* Polls Section - Above buttons */}
        <div className="event-polls-section">
          <div className="event-polls-header">
            <button
              type="button"
              onClick={handleCreatePoll}
              className="create-poll-button"
              disabled={loading || loadingPolls}
            >
              {showPollForm && !editingPoll 
                ? (event?.id ? '− Cancel' : '− Cancel')
                : (event?.id ? '+ Create Poll' : '+ Add Polls')
              }
            </button>
          </div>

          {showPollForm ? (
            <PollForm
              poll={editingPoll}
              eventId={event?.id}
              onSubmit={handlePollFormSubmit}
              onCancel={handlePollFormCancel}
              loading={loadingPolls}
            />
          ) : (
            <>
              {/* Show new polls (for new events) */}
              {!event?.id && newPolls.length > 0 && (
                <div className="polls-grid">
                  {newPolls.map((poll, index) => (
                    <div key={`new-${index}`} className="poll-card">
                      <div className="poll-card-header">
                        <h4>{poll.question}</h4>
                        {poll.allowMultiple && (
                          <span className="multiple-answers-badge">Multiple answers</span>
                        )}
                      </div>
                      <div className="poll-options-preview">
                        <ul>
                          {poll.options && poll.options.map((option, optIndex) => (
                            <li key={optIndex}>{option}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="poll-card-actions">
                        <button
                          onClick={() => handleEditPoll(poll, index)}
                          className="edit-button"
                          disabled={loadingPolls}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePoll(null, index)}
                          className="delete-button"
                          disabled={loadingPolls}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show existing polls (for existing events) */}
              {event?.id && polls.length > 0 && (
                <div className="polls-grid">
                  {polls.map((poll) => (
                    <div key={poll.id} className="poll-card">
                      <div className="poll-card-header">
                        <h4>{poll.question}</h4>
                        {poll.allowMultiple && (
                          <span className="multiple-answers-badge">Multiple answers</span>
                        )}
                      </div>
                      <div className="poll-options-preview">
                        <ul>
                          {poll.options && poll.options.map((option, index) => (
                            <li key={index}>{option}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="poll-card-actions">
                        <button
                          onClick={() => handleEditPoll(poll)}
                          className="edit-button"
                          disabled={loadingPolls}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePoll(poll.id)}
                          className="delete-button"
                          disabled={loadingPolls}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Loading state for existing polls */}
              {event?.id && loadingPolls && (
                <div className="loading-state">
                  <p>Loading polls...</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EventForm

