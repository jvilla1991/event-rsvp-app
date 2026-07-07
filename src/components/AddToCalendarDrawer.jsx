import { useEffect, useState } from 'react'
import { buildGoogleCalendarUrl, downloadIcs } from '../utils/calendar'

const ANIM_MS = 280

/**
 * Slide-up bottom sheet shown after a "Yes" RSVP, offering to drop the event onto the
 * attendee's phone calendar. "Google Calendar" opens a prefilled Google event; "Apple /
 * Outlook / Other" downloads an .ics file the OS calendar app picks up.
 *
 * Mounts closed, then animates open on the next frame; closing waits for the slide-down
 * transition before calling onClose so the parent can unmount it.
 */
function AddToCalendarDrawer({ event, onClose }) {
  const [open, setOpen] = useState(false)

  // Trigger the open transition one frame after mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Close on Escape, and lock background scroll while the sheet is up.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClose = () => {
    setOpen(false)
    setTimeout(onClose, ANIM_MS)
  }

  const openGoogle = () => {
    const url = buildGoogleCalendarUrl(event)
    if (url) window.open(url, '_blank', 'noopener')
    handleClose()
  }

  const handleDownload = () => {
    downloadIcs(event)
    handleClose()
  }

  if (!event?.eventDateTime) return null

  return (
    <div
      className={`calendar-drawer-overlay ${open ? 'open' : ''}`}
      onClick={handleClose}
    >
      <div
        className="calendar-drawer"
        role="dialog"
        aria-label="Add this event to your calendar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="calendar-drawer-handle" />
        <h3 className="calendar-drawer-title">You're in! Add it to your calendar?</h3>
        <div className="calendar-drawer-buttons">
          <button type="button" className="calendar-drawer-button" onClick={openGoogle}>
            Google Calendar
          </button>
          <button type="button" className="calendar-drawer-button" onClick={handleDownload}>
            Apple / Outlook / Other
          </button>
        </div>
        <button type="button" className="calendar-drawer-dismiss" onClick={handleClose}>
          Maybe later
        </button>
      </div>
    </div>
  )
}

export default AddToCalendarDrawer
