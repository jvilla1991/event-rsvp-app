import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import RSVPForm from '../components/RSVPForm'
import AttendeeList from '../components/AttendeeList'
import PollDisplay from '../components/PollDisplay'
import InviteShare from '../components/InviteShare'
import { getEvent, viewInvite } from '../services/api'
import { formatEventDate } from '../utils/dateFormat'
import { useAuth } from '../contexts/AuthContext'

function PublicEventPage() {
  const { eventId: eventIdParam } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [event, setEvent] = useState(null)
  const [eventId, setEventId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAttendees, setShowAttendees] = useState(false)
  const [addressCopied, setAddressCopied] = useState(false)
  const [addressHolding, setAddressHolding] = useState(false)
  const holdTimerRef = useRef(null)
  const longPressFiredRef = useRef(false)
  // Name pre-filled from invite — set via router state (InvitePage redirect) or ?invite= query
  const [inviteeName, setInviteeName] = useState(location.state?.inviteeName || '')

  // Detect whether the user arrived from the admin dashboard
  const fromAdmin = location.state?.fromAdmin === true

  // Mark invite as viewed and pre-fill name when arriving via ?invite=TOKEN
  useEffect(() => {
    const inviteToken = searchParams.get('invite')
    if (inviteToken) {
      viewInvite(inviteToken)
        .then((invite) => {
          if (invite.name) setInviteeName(invite.name)
        })
        .catch(() => {})
      // Remove the token from the URL so refreshing / sharing the URL further
      // doesn't re-trigger a duplicate view event
      setSearchParams({}, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventIdParam) {
        setError('Event ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const parsedEventId = parseInt(eventIdParam)
        if (isNaN(parsedEventId)) {
          setError('Invalid event ID. Please select an event from the list.')
          setLoading(false)
          return
        }

        const eventData = await getEvent(parsedEventId)
        setEventId(parsedEventId)
        setEvent(eventData)
      } catch (err) {
        console.error('Error fetching event:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventIdParam])

  const handleRSVPSuccess = () => {}

  const getGoogleMapsUrl = (address) => {
    if (!address) return '#'
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }

  // How long the user must hold the address before it copies (ms).
  const HOLD_TO_COPY_MS = 500

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(event.address)
      setAddressCopied(true)
      if (typeof navigator.vibrate === 'function') navigator.vibrate(40) // haptic confirm on mobile
      setTimeout(() => setAddressCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — silently ignore
    }
  }

  // Desktop: the dedicated copy button.
  const handleCopyAddress = () => copyAddress()

  // Mobile: press-and-hold the address itself to copy (no separate button needed).
  const startAddressHold = () => {
    longPressFiredRef.current = false
    setAddressHolding(true)
    holdTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true
      setAddressHolding(false)
      copyAddress()
    }, HOLD_TO_COPY_MS)
  }

  const cancelAddressHold = () => {
    setAddressHolding(false)
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  const handleAddressClick = (e) => {
    // If a hold just copied the address, swallow the click so it doesn't also open Maps.
    if (longPressFiredRef.current) {
      e.preventDefault()
      longPressFiredRef.current = false
    }
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading-state">
          <p>Loading event...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="app">
        <div className="error-state">
          <p>No event found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-nav">
          {fromAdmin ? (
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="back-nav-button"
            >
              ← Back to Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="back-nav-button"
            >
              ← View All Events
            </button>
          )}
        </div>
        <h1>{event.title || 'Event RSVP'}</h1>
        {event.description && (
          <p className="subtitle">{event.description}</p>
        )}
        {event.eventDateTime && (
          <p className="event-date">
            {formatEventDate(event.eventDateTime)}
          </p>
        )}
        {event.address && (
          <div className="event-address">
            <p className="address-label">Event Location:</p>
            <div className="address-row">
              <div className="address-link-wrap">
                <a
                  href={getGoogleMapsUrl(event.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`address-link${addressHolding ? ' address-holding' : ''}${addressCopied ? ' address-copied' : ''}`}
                  style={{ '--hold-ms': `${HOLD_TO_COPY_MS}ms` }}
                  onPointerDown={startAddressHold}
                  onPointerUp={cancelAddressHold}
                  onPointerLeave={cancelAddressHold}
                  onPointerCancel={cancelAddressHold}
                  onClick={handleAddressClick}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <span className="address-text">{event.address}</span>
                  {addressCopied ? (
                    <span className="address-hint address-hint--copied">✓ Address copied!</span>
                  ) : addressHolding ? (
                    <span className="address-hint address-hint--holding">Keep holding to copy…</span>
                  ) : (
                    <>
                      <span className="address-hint address-hint--desktop">Click to open in Google Maps →</span>
                      <span className="address-hint address-hint--touch">Press &amp; hold to copy · tap to open Maps</span>
                    </>
                  )}
                </a>
                <button
                  type="button"
                  className="address-copy-button"
                  onClick={handleCopyAddress}
                  title={addressCopied ? 'Copied!' : 'Copy address'}
                >
                  {addressCopied ? '✓' : '⧉'}
                </button>
              </div>
            </div>
          </div>
        )}
        <br></br>
        <div>
          <InviteShare eventId={eventId} />
        </div>
      </header>

      <main className="app-main">
        <RSVPForm eventId={eventId} event={event} onRSVPSuccess={handleRSVPSuccess} allowTimeProposal={event?.allowTimeProposal ?? false} initialName={inviteeName} />
        <PollDisplay eventId={eventId} allowGuestPolls={event?.allowGuestPolls ?? false} />
        <div className="attendees-toggle-section">
          <button
            onClick={() => setShowAttendees(!showAttendees)}
            className="toggle-attendees-button"
          >
            {showAttendees ? 'Hide' : 'Show'} Attendees
          </button>
          {showAttendees && <AttendeeList eventId={eventId} isAdmin={isAuthenticated} />}
        </div>
      </main>
    </div>
  )
}

export default PublicEventPage
