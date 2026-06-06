import { useState, useEffect, useCallback } from 'react'
import { getEventPolls, submitPollVote, getPollResults, createPoll } from '../services/api'
import PollForm from './PollForm'

function PollDisplay({ eventId, allowGuestPolls = false }) {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [votedPolls, setVotedPolls] = useState(new Set())
  const [pollResults, setPollResults] = useState({})
  const [showResults, setShowResults] = useState({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)

  const loadPolls = useCallback(async () => {
    if (!eventId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const data = await getEventPolls(eventId)
      setPolls(data || [])

      // Load results for all polls
      const results = {}
      for (const poll of data || []) {
        try {
          const result = await getPollResults(eventId, poll.id)
          results[poll.id] = result
        } catch (err) {
          console.error(`Error fetching results for poll ${poll.id}:`, err)
        }
      }
      setPollResults(results)
    } catch (err) {
      console.error('Error fetching polls:', err)
      setError(err.response?.data?.message || 'Failed to load polls')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    loadPolls()
  }, [loadPolls])

  const handleGuestCreatePoll = async (pollData) => {
    try {
      setCreating(true)
      await createPoll(eventId, pollData)
      setShowCreateForm(false)
      await loadPolls()
    } catch (err) {
      console.error('Error creating poll:', err)
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to create poll. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleVote = async (pollId, selectedOptions) => {
    if (!eventId) return

    try {
      const voteData = {
        selectedOptions: Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions],
      }

      await submitPollVote(eventId, pollId, voteData)
      setVotedPolls(prev => new Set([...prev, pollId]))
      
      // Refresh results
      const result = await getPollResults(eventId, pollId)
      setPollResults(prev => ({ ...prev, [pollId]: result }))
      setShowResults(prev => ({ ...prev, [pollId]: true }))
    } catch (err) {
      console.error('Error submitting vote:', err)
      alert(err.response?.data?.message || 'Failed to submit vote. Please try again.')
    }
  }

  const toggleResults = async (pollId) => {
    if (!showResults[pollId]) {
      try {
        const result = await getPollResults(eventId, pollId)
        setPollResults(prev => ({ ...prev, [pollId]: result }))
      } catch (err) {
        console.error('Error fetching poll results:', err)
      }
    }
    setShowResults(prev => ({ ...prev, [pollId]: !prev[pollId] }))
  }

  if (loading) {
    return (
      <section className="polls-section">
        <h2>Polls</h2>
        <div className="loading-state">
          <p>Loading polls...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="polls-section">
        <h2>Polls</h2>
        <div className="error-state">
          <p>{error}</p>
        </div>
      </section>
    )
  }

  // Nothing to show: no polls and guests can't add any.
  if (polls.length === 0 && !allowGuestPolls) {
    return null
  }

  return (
    <section className="polls-section">
      <h2>Event Polls</h2>

      {polls.length === 0 && (
        <p className="polls-empty-hint">No polls yet — be the first to create one!</p>
      )}

      <div className="polls-list">
        {polls.map((poll) => {
          const hasVoted = votedPolls.has(poll.id)
          const results = pollResults[poll.id]
          const showPollResults = showResults[poll.id]

          return (
            <PollCard
              key={poll.id}
              poll={poll}
              hasVoted={hasVoted}
              results={results}
              showResults={showPollResults}
              onVote={handleVote}
              onToggleResults={toggleResults}
            />
          )
        })}
      </div>

      {allowGuestPolls && (
        <div className="guest-poll-create">
          {showCreateForm ? (
            <PollForm
              eventId={eventId}
              onSubmit={handleGuestCreatePoll}
              onCancel={() => setShowCreateForm(false)}
              loading={creating}
            />
          ) : (
            <button
              type="button"
              className="create-poll-button"
              onClick={() => setShowCreateForm(true)}
            >
              + Create a Poll
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function PollCard({ poll, hasVoted, results, showResults, onVote, onToggleResults }) {
  const [selectedOptions, setSelectedOptions] = useState([])

  const handleOptionChange = (optionIndex) => {
    if (poll.allowMultiple) {
      setSelectedOptions(prev => {
        if (prev.includes(optionIndex)) {
          return prev.filter(idx => idx !== optionIndex)
        } else {
          return [...prev, optionIndex]
        }
      })
    } else {
      setSelectedOptions([optionIndex])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedOptions.length === 0) {
      alert('Please select at least one option')
      return
    }
    onVote(poll.id, selectedOptions)
    setSelectedOptions([])
  }

  const totalVotes = results?.totalVotes || 0
  const optionVotes = results?.optionVotes || {}

  return (
    <div className="poll-card-public">
      <h3>{poll.question}</h3>
      {poll.allowMultiple && (
        <p className="poll-hint">You can select multiple answers</p>
      )}

      {!hasVoted ? (
        <form onSubmit={handleSubmit} className="poll-vote-form">
          <div className="poll-options">
            {poll.options && poll.options.map((option, index) => (
              <label key={index} className="poll-option-label">
                <input
                  type={poll.allowMultiple ? 'checkbox' : 'radio'}
                  name={`poll-${poll.id}`}
                  value={index}
                  checked={selectedOptions.includes(index)}
                  onChange={() => handleOptionChange(index)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          <button type="submit" className="submit-vote-button">
            Submit Vote
          </button>
        </form>
      ) : (
        <div className="poll-voted-message">
          <p>✓ You have voted on this poll</p>
        </div>
      )}

      <button
        onClick={() => onToggleResults(poll.id)}
        className="toggle-results-button"
      >
        {showResults ? 'Hide' : 'Show'} Results ({totalVotes} {totalVotes === 1 ? 'vote' : 'votes'})
      </button>

      {showResults && results && (
        <div className="poll-results">
          {poll.options && poll.options.map((option, index) => {
            const votes = optionVotes[index] || 0
            const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0

            return (
              <div key={index} className="poll-result-item">
                <div className="poll-result-header">
                  <span className="poll-result-option">{option}</span>
                  <span className="poll-result-count">
                    {votes} {votes === 1 ? 'vote' : 'votes'} ({percentage}%)
                  </span>
                </div>
                <div className="poll-result-bar-container">
                  <div
                    className="poll-result-bar"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PollDisplay
