/**
 * Build "add to calendar" links/files from an event.
 *
 * Events have a start time (`eventDateTime`, a UTC ISO string) but no end time in the
 * data model, so we default to a fixed-length block. Times are emitted in UTC (the `Z`
 * suffix); Google Calendar and the OS calendar app convert them to the device's local
 * time automatically, so we don't deal with timezones here.
 */

const DEFAULT_DURATION_HOURS = 3

// Date -> "YYYYMMDDTHHMMSSZ" (the basic UTC format both .ics and Google expect).
function toIcsUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

// Escape text for an .ics value per RFC 5545 (backslash, semicolon, comma, newlines).
function escapeIcsText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// Returns { start, end } as Date objects, or null when the event has no start time.
function getEventWindow(event) {
  if (!event?.eventDateTime) return null
  const start = new Date(event.eventDateTime)
  if (isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + DEFAULT_DURATION_HOURS * 60 * 60 * 1000)
  return { start, end }
}

/**
 * Prefilled Google Calendar "create event" URL. Opens in the browser / Google Calendar app.
 */
export function buildGoogleCalendarUrl(event) {
  const window = getEventWindow(event)
  if (!window) return null

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Event',
    dates: `${toIcsUtc(window.start)}/${toIcsUtc(window.end)}`,
  })
  if (event.description) params.set('details', event.description)
  if (event.address) params.set('location', event.address)

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * A full VCALENDAR/VEVENT document as a string, suitable for an .ics download.
 */
export function buildIcsContent(event) {
  const window = getEventWindow(event)
  if (!window) return null

  const uid = `event-${event.id ?? 'unknown'}-${toIcsUtc(window.start)}@rsvp.villa-dev.com`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//villa-dev//Event RSVP//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(window.start)}`,
    `DTEND:${toIcsUtc(window.end)}`,
    `SUMMARY:${escapeIcsText(event.title || 'Event')}`,
  ]
  if (event.description) lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`)
  if (event.address) lines.push(`LOCATION:${escapeIcsText(event.address)}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Build the .ics and trigger a browser download. On a phone the OS picks the file up and
 * offers "Add to Calendar"; on desktop it imports into Apple Calendar / Outlook / etc.
 */
export function downloadIcs(event) {
  const content = buildIcsContent(event)
  if (!content) return

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const safeName = (event.title || 'event').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  const link = document.createElement('a')
  link.href = url
  link.download = `${safeName}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
