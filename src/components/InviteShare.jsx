import { useState } from 'react'
import { createInvite } from '../services/api'

function InviteShare({ eventId }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [generated, setGenerated] = useState(false) // a link exists for the current name
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [error, setError] = useState('')

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setCopyFailed(false)
    } catch {
      // Clipboard blocked (e.g. insecure context) — fall back to manual copy.
      setCopied(false)
      setCopyFailed(true)
    }
  }

  // One tap: create the invite AND copy it. The button then disables until the
  // name changes, so you can't accidentally generate/copy the same link twice.
  const handleGenerate = async () => {
    setError('')
    try {
      setLoading(true)
      const invite = await createInvite(eventId, name.trim() || null)
      const link = `${window.location.origin}/event/${eventId}?invite=${invite.token}`
      setInviteLink(link)
      setGenerated(true)
      await copyToClipboard(link)
    } catch {
      setError('Failed to generate invite link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Editing the name means a different person → re-arm the button for a fresh link.
  const handleNameChange = (e) => {
    setName(e.target.value)
    if (generated || inviteLink) {
      setGenerated(false)
      setInviteLink('')
      setCopied(false)
      setCopyFailed(false)
      setError('')
    }
  }

  const handleClose = () => {
    setOpen(false)
    setName('')
    setInviteLink('')
    setGenerated(false)
    setCopied(false)
    setCopyFailed(false)
    setError('')
  }

  const buttonLabel = loading
    ? 'Generating…'
    : generated
      ? (copyFailed ? '✓ Link Ready' : '✓ Copied!')
      : 'Generate & Copy Link'

  return (
    <section className="invite-share-section">
      {!open ? (
        <button className="invite-share-toggle" onClick={() => setOpen(true)}>
          Share This Event
        </button>
      ) : (
        <div className="invite-share-panel">
          <div className="invite-share-header">
            <h3>Share This Event</h3>
            <button className="invite-close-button" onClick={handleClose} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="invite-share-form">
            <p className="invite-share-hint">
              Enter a name and tap Generate — the link is copied to your clipboard automatically.
              Change the name to make a separate link for someone else.
            </p>
            <div className="invite-form-row">
              <input
                type="text"
                placeholder="Name (optional — e.g. Bob)"
                value={name}
                onChange={handleNameChange}
                onKeyDown={(e) => e.key === 'Enter' && !loading && !generated && handleGenerate()}
                className="invite-name-input"
                maxLength={200}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || generated}
                className={`invite-generate-button ${generated && !copyFailed ? 'copied' : ''}`}
              >
                {buttonLabel}
              </button>
            </div>
            {error && <p className="invite-error-text">{error}</p>}
          </div>

          {inviteLink && (
            <div className="invite-link-result">
              <p className={`invite-link-label ${copied ? 'invite-link-label--copied' : ''}`}>
                {copied
                  ? (name.trim() ? `✓ Link for ${name.trim()} copied to clipboard!` : '✓ Link copied to clipboard!')
                  : (name.trim() ? `Link for ${name.trim()}:` : 'Shareable link:')}
              </p>
              <div className="invite-link-row">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="invite-link-input"
                  onClick={(e) => e.target.select()}
                />
                {copyFailed && (
                  <button onClick={() => copyToClipboard(inviteLink)} className="invite-copy-button">
                    Copy
                  </button>
                )}
              </div>
              {copyFailed && (
                <p className="invite-share-hint">
                  Couldn’t copy automatically — tap the link to select it, then copy.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default InviteShare
