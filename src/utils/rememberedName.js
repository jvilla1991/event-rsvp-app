// Remembers the visitor's name on their own device (this browser only) so the
// RSVP form can pre-fill it on any event. Purely client-side — nothing is sent
// anywhere it wasn't already going. All access is wrapped in try/catch because
// localStorage can throw (Safari private mode, storage disabled, quota, etc.).

const STORAGE_KEY = 'rsvpVisitorName'

export function getRememberedName() {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function rememberName(name) {
  const trimmed = (name || '').trim()
  if (!trimmed) return
  try {
    localStorage.setItem(STORAGE_KEY, trimmed)
  } catch {
    // Ignore — remembering the name is a convenience, not a requirement.
  }
}
