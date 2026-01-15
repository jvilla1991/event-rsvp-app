import { useState, useEffect } from 'react'

function EventForm({ event, onSubmit, onCancel, loading }) {
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [eventDateTime, setEventDateTime] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (event) {
      setTitle(event.title || '')
      setAddress(event.address || '')
      setDescription(event.description || '')
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
    } else {
      // Reset form for new event
      setTitle('')
      setAddress('')
      setEventDateTime('')
      setDescription('')
    }
    setError('')
  }, [event])

  const handleSubmit = (e) => {
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
    }

    onSubmit(eventData)
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

