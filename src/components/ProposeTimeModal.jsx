import { useState } from 'react'

function ProposeTimeModal({ name, onPropose, onDecline }) {
  const [proposedTime, setProposedTime] = useState('')

  const handlePropose = () => {
    const parsed = proposedTime ? new Date(proposedTime).toISOString() : null
    onPropose(parsed)
  }

  const handleDecline = () => {
    onDecline()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">Can't make it{name ? `, ${name}` : ''}?</h3>
        <p className="modal-subtitle">Would you like to suggest a different time, or simply decline?</p>

        <div className="modal-datetime-group">
          <label htmlFor="proposed-time" className="modal-label">
            Suggest a time <span className="modal-label-optional">(optional)</span>
          </label>
          <input
            type="datetime-local"
            id="proposed-time"
            className="modal-datetime-input"
            value={proposedTime}
            onChange={(e) => setProposedTime(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-propose-button"
            onClick={handlePropose}
          >
            {proposedTime ? 'Propose This Time' : 'Send Anyway'}
          </button>
          <button
            type="button"
            className="modal-decline-button"
            onClick={handleDecline}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProposeTimeModal
