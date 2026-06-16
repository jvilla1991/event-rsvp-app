import { buildGoogleCalendarUrl, downloadIcs } from '../utils/calendar'

/**
 * Shown after a "Yes" RSVP: lets the attendee drop the event onto their phone calendar.
 * "Google Calendar" opens a prefilled Google event; "Apple / Outlook / Other" downloads an
 * .ics file the OS calendar app picks up.
 */
function AddToCalendarMenu({ event }) {
  if (!event?.eventDateTime) return null

  const openGoogle = () => {
    const url = buildGoogleCalendarUrl(event)
    if (url) window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="add-to-calendar">
      <h3 className="add-to-calendar-title">Add this to your calendar</h3>
      <div className="add-to-calendar-buttons">
        <button type="button" className="add-to-calendar-button" onClick={openGoogle}>
          Google Calendar
        </button>
        <button
          type="button"
          className="add-to-calendar-button"
          onClick={() => downloadIcs(event)}
        >
          Apple / Outlook / Other
        </button>
      </div>
    </div>
  )
}

export default AddToCalendarMenu
