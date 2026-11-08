// Ordering + "past" logic shared by the event listing pages.
//
// Display order:
//   1. Upcoming (and today's) events first, soonest date first.
//   2. Events with no date next (nothing to sort them by, and they aren't "past").
//   3. Past events last, most-recent first — these are shown grayed out.
//
// "Past" means the event's calendar date is before today (local time). An event
// happening *today* is still treated as upcoming, so it isn't grayed out on the
// day it actually occurs.

function eventTime(event) {
  if (!event?.eventDateTime) return null
  const d = new Date(event.eventDateTime)
  return isNaN(d.getTime()) ? null : d.getTime()
}

export function isPastEvent(event, now = new Date()) {
  const t = eventTime(event)
  if (t === null) return false
  const eventDate = new Date(t)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDayStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  return eventDayStart < todayStart
}

export function sortEventsForDisplay(events, now = new Date()) {
  const upcoming = []
  const undated = []
  const past = []

  for (const event of events) {
    if (eventTime(event) === null) undated.push(event)
    else if (isPastEvent(event, now)) past.push(event)
    else upcoming.push(event)
  }

  upcoming.sort((a, b) => eventTime(a) - eventTime(b)) // soonest first
  past.sort((a, b) => eventTime(b) - eventTime(a))     // most-recent past first

  return [...upcoming, ...undated, ...past]
}
