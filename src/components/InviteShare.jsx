import { useState } from 'react'
import { createInvite } from '../services/api'

function InviteShare({ eventId }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setError('')
    setInviteLink('')
    try {
      setLoading(true)
      const invite = await createInvite(eventId, name.trim() || null)
      const link = `${window.location.origin}/invite/${invite.token}`
      setInviteLink(link)
    } catch {
      setError('Failed to generate invite link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard API unavailable — user can select manually
    }
  }

  const handleReset = () => {
    setName('')
    setInviteLink('')
    setCopied(false)
    setError('')
  }

  const handleClose = () => {
    setOpen(false)
    handleReset()
  }

  return (
    <section className="invite-share-section">
      {!open ? (
        <button className="invite-share-toggle" onClick={() => setOpen(true)}>
          📤 Share This Event
        </button>
      ) : (
        <div className="invite-share-panel">
          <div className="invite-share-header">
            <h3>Share This Event</h3>
            <button className="invite-close-button" onClick={handleClose} aria-label="Close">
              ✕
            </button>
          </div>

          {!inviteLink ? (
            <div className="invite-share-form">
              <p className="invite-share-hint">
                Generate a unique shareable link. Optionally enter a name so you can track who has opened it.
              </p>
              <div className="invite-form-row">
                <input
                  type="text"
                  placeholder="Name (optional — e.g. Bob)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
                  className="invite-name-input"
                  maxLength={200}
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="invite-generate-button"
                >
                  {loading ? 'Generating…' : 'Generate Link'}
                </button>
              </div>
              {error && <p className="invite-error-text">{error}</p>}
            </div>
          ) : (
            <div className="invite-link-result">
              <p className="invite-link-label">
                {name.trim() ? `Link for ${name.trim()}:` : 'Shareable link:'}
              </p>
              <div className="invite-link-row">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="invite-link-input"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={handleCopy}
                  className={`invite-copy-button ${copied ? 'copied' : ''}`}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <button onClick={handleReset} className="invite-another-button">
                + Generate Another
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default InviteShare
