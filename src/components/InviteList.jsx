import { useState, useEffect } from 'react'
import { getInvites, deleteInvite } from '../services/api'

function InviteList({ eventId, eventTitle, onClose }) {
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInvites()
  }, [eventId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInvites = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getInvites(eventId)
      setInvites(data || [])
    } catch {
      setError('Failed to load invites.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (inviteId, inviteName) => {
    const label = inviteName || 'this anonymous invite'
    if (!window.confirm(`Delete invite for ${label}?`)) return
    try {
      await deleteInvite(eventId, inviteId)
      setInvites(prev => prev.filter(i => i.id !== inviteId))
    } catch {
      alert('Failed to delete invite. Please try again.')
    }
  }

  const viewedCount = invites.filter(i => i.status !== 'NotOpened').length

  return (
    <div className="invite-list-panel">
      <div className="invite-list-header">
        <div>
          <h3 className="invite-list-title">Invite Tracking</h3>
          <p className="invite-list-subtitle">
            {eventTitle} &mdash;{' '}
            {invites.length} invite{invites.length !== 1 ? 's' : ''},{' '}
            {viewedCount} opened
          </p>
        </div>
        <button className="invite-panel-close-button" onClick={onClose}>
          ✕ Close
        </button>
      </div>

      {loading && <p className="invite-list-status">Loading invites…</p>}
      {error && <p className="invite-list-status invite-list-error">{error}</p>}

      {!loading && !error && invites.length === 0 && (
        <div className="invite-list-empty">
          <p>No invites have been created for this event yet.</p>
          <p className="invite-list-empty-hint">
            Invites are generated from the public event page using the &ldquo;Share This Event&rdquo; button.
          </p>
        </div>
      )}

      {!loading && invites.length > 0 && (
        <div className="invite-table-container">
          <table className="invite-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Opened At</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invites.map(invite => (
                <tr key={invite.id}>
                  <td className="invite-name-cell">
                    {invite.name
                      ? invite.name
                      : <span className="invite-anonymous">Anonymous</span>}
                  </td>
                  <td>
                    {invite.status !== 'NotOpened'
                      ? <span className="invite-badge invite-badge-viewed">✓ Opened</span>
                      : <span className="invite-badge invite-badge-pending">Not Opened</span>}
                  </td>
                  <td className="invite-date-cell">
                    {invite.viewedAt
                      ? new Date(invite.viewedAt).toLocaleString()
                      : '—'}
                  </td>
                  <td className="invite-date-cell">
                    {new Date(invite.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="invite-delete-button"
                      onClick={() => handleDelete(invite.id, invite.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default InviteList
