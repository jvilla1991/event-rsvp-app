import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createEvent, updateEvent, deleteEvent, getEvent } from '../services/api'
import EventList from '../components/EventList'
import EventForm from '../components/EventForm'
import InviteList from '../components/InviteList'

function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Invite tracking panel state
  const [inviteEventId, setInviteEventId] = useState(null)
  const [inviteEventTitle, setInviteEventTitle] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const handleView = (eventId) => {
    navigate(`/event/${eventId}`)
  }

  const handleCreate = () => {
    setEditingEvent(null)
    setShowForm(true)
  }

  const handleEdit = async (eventId) => {
    try {
      setLoading(true)
      const event = await getEvent(eventId)
      setEditingEvent(event)
      setShowForm(true)
    } catch (err) {
      console.error('Error fetching event:', err)
      alert('Failed to load event for editing')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }
    try {
      setLoading(true)
      await deleteEvent(eventId)
      setRefreshKey(prev => prev + 1)
      // Close invite panel if it was showing this event
      if (inviteEventId === eventId) setInviteEventId(null)
    } catch (err) {
      console.error('Error deleting event:', err)
      alert('Failed to delete event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (eventData) => {
    try {
      setLoading(true)
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData)
      } else {
        await createEvent(eventData)
      }
      setShowForm(false)
      setEditingEvent(null)
      setRefreshKey(prev => prev + 1)
    } catch (err) {
      console.error('Error saving event:', err)
      alert(err.response?.data?.message || 'Failed to save event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingEvent(null)
  }

  const handleInvites = (eventId, eventTitle) => {
    setInviteEventId(eventId)
    setInviteEventTitle(eventTitle || 'Event')
  }

  const handleCloseInvites = () => {
    setInviteEventId(null)
    setInviteEventTitle('')
  }

  return (
    <div className="app">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          {!showForm && (
            <button onClick={handleCreate} className="create-button">
              + Create Event
            </button>
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <main className="admin-dashboard-main">
        {showForm ? (
          <EventForm
            event={editingEvent}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={loading}
          />
        ) : (
          <>
            <EventList
              key={refreshKey}
              onView={handleView}
              onEdit={handleEdit}
              onInvites={handleInvites}
              onDelete={handleDelete}
            />

            {inviteEventId && (
              <InviteList
                eventId={inviteEventId}
                eventTitle={inviteEventTitle}
                onClose={handleCloseInvites}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
