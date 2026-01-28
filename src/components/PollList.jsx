import { useState, useEffect } from 'react'
import { getEventPolls } from '../services/api'

function PollList({ eventId, onEdit, onDelete, onCreate }) {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPolls = async () => {
      if (!eventId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const data = await getEventPolls(eventId)
        setPolls(data || [])
      } catch (err) {
        console.error('Error fetching polls:', err)
        setError(err.response?.data?.message || 'Failed to load polls')
      } finally {
        setLoading(false)
      }
    }

    fetchPolls()
  }, [eventId])

  if (loading) {
    return (
      <div className="poll-list-container">
        <div className="poll-list-header">
          <h3>Event Polls</h3>
          <button onClick={onCreate} className="create-poll-button">
            + Create Poll
          </button>
        </div>
        <div className="loading-state">
          <p>Loading polls...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="poll-list-container">
        <div className="poll-list-header">
          <h3>Event Polls</h3>
          <button onClick={onCreate} className="create-poll-button">
            + Create Poll
          </button>
        </div>
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="poll-list-container">
      <div className="poll-list-header">
        <h3>Event Polls ({polls.length})</h3>
        <button onClick={onCreate} className="create-poll-button">
          + Create Poll
        </button>
      </div>
      {polls.length === 0 ? null : (
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
                  onClick={() => onEdit(poll)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(poll.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PollList
