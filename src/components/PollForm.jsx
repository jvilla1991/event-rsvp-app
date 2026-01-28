import { useState, useEffect } from 'react'

function PollForm({ poll, eventId, onSubmit, onCancel, loading }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [allowMultiple, setAllowMultiple] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (poll) {
      setQuestion(poll.question || '')
      setOptions(poll.options && poll.options.length > 0 ? poll.options : ['', ''])
      setAllowMultiple(poll.allowMultiple || false)
    } else {
      // Reset form for new poll
      setQuestion('')
      setOptions(['', ''])
      setAllowMultiple(false)
    }
    setError('')
  }, [poll])

  const handleAddOption = () => {
    setOptions([...options, ''])
  }

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    } else {
      setError('A poll must have at least 2 options')
    }
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    setError('')
  }

  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    setError('')

    if (!question.trim()) {
      setError('Poll question is required')
      return
    }

    const validOptions = options.filter(opt => opt.trim() !== '')
    if (validOptions.length < 2) {
      setError('A poll must have at least 2 options')
      return
    }

    const pollData = {
      question: question.trim(),
      options: validOptions.map(opt => opt.trim()),
      allowMultiple: allowMultiple,
    }

    try {
      onSubmit(pollData)
    } catch (err) {
      console.error('Error in onSubmit:', err)
      setError('An error occurred while submitting the poll')
    }
  }

  return (
    <div className="poll-form-container">
      <h3>{poll ? 'Edit Poll' : 'Create New Poll'}</h3>
      <div className="poll-form">
        <div className="form-group">
          <label htmlFor="question">Poll Question *</label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              setError('')
            }}
            placeholder="Enter poll question"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Poll Options *</label>
          {options.map((option, index) => (
            <div key={index} className="option-input-group">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                disabled={loading}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="remove-option-button"
                  disabled={loading}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="add-option-button"
            disabled={loading}
          >
            + Add Option
          </button>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              disabled={loading}
            />
            <span>Allow multiple answers</span>
          </label>
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
            type="button"
            onClick={handleSubmit}
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : poll ? 'Update Poll' : 'Create Poll'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PollForm
