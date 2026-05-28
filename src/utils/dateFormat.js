/**
 * Format an event date/time string to include the full day of the week.
 * e.g. "Wednesday, May 28, 2026, 2:00 PM"
 */
export function formatEventDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
