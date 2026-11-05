import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle 401 errors (token expiration/invalid)
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear the token from localStorage
      localStorage.removeItem('authToken')
      
      // Dispatch a custom event that AuthContext can listen to
      // This will update the auth state, and ProtectedRoute will handle redirect
      window.dispatchEvent(new CustomEvent('auth:logout'))
      
      // Only do a hard redirect if we're not already on the login page
      // This handles cases where the redirect might not happen naturally
      if (window.location.pathname !== '/admin/login' && !window.location.pathname.startsWith('/admin/login')) {
        // Use setTimeout to allow the event to propagate first
        setTimeout(() => {
          window.location.href = '/admin/login'
        }, 0)
      }
    }
    return Promise.reject(error)
  }
)

// Public endpoints
export const getEvents = async () => {
  const response = await api.get('/api/events')
  return response.data
}

export const getEvent = async (id) => {
  const parsedId = parseInt(id)
  if (isNaN(parsedId)) {
    throw new Error('Invalid event ID')
  }
  
  const response = await api.get(`/api/events/${parsedId}`)
  return response.data
}

export const getEventRSVPs = async (eventId) => {
  const parsedEventId = parseInt(eventId)
  if (isNaN(parsedEventId)) {
    throw new Error('Invalid event ID')
  }
  
  const response = await api.get(`/api/events/${parsedEventId}/rsvps`)
  return response.data
}

// Unified attendance: invited people (Tentative until they respond) merged with RSVPs.
export const getEventAttendance = async (eventId) => {
  const parsedEventId = parseInt(eventId)
  if (isNaN(parsedEventId)) {
    throw new Error('Invalid event ID')
  }

  const response = await api.get(`/api/events/${parsedEventId}/rsvps/attendance`)
  return response.data
}

// Admin-only: remove a person from the attendance list. The list merges tracked
// invites and walk-in RSVPs, so `source` ("invite" or "rsvp") tells the API which
// record backs the row being removed.
export const deleteAttendee = async (eventId, source, id) => {
  const parsedEventId = parseInt(eventId)
  const parsedId = parseInt(id)
  if (isNaN(parsedEventId) || isNaN(parsedId)) {
    throw new Error('Invalid event ID or attendee ID')
  }
  if (source !== 'invite' && source !== 'rsvp') {
    throw new Error('Invalid attendance source')
  }

  const response = await api.delete(`/api/events/${parsedEventId}/rsvps/attendance/${source}/${parsedId}`)
  return response.data
}

export const submitRSVP = async (eventId, rsvpData) => {
  const parsedEventId = parseInt(eventId)
  if (isNaN(parsedEventId)) {
    throw new Error('Invalid event ID')
  }
  
  const response = await api.post(`/api/events/${parsedEventId}/rsvps`, rsvpData)
  return response.data
}

// Auth endpoints
export const login = async (username, password) => {
  const response = await api.post('/api/auth/login', { username, password })
  return response.data
}

// Admin endpoints (require auth token)
export const createEvent = async (eventData) => {
  const response = await api.post('/api/events', eventData)
  return response.data
}

export const updateEvent = async (id, eventData) => {
  const response = await api.put(`/api/events/${id}`, eventData)
  return response.data
}

export const deleteEvent = async (id) => {
  const response = await api.delete(`/api/events/${id}`)
  return response.data
}

// Poll endpoints
export const getEventPolls = async (eventId) => {
  const parsedEventId = parseInt(eventId)
  if (isNaN(parsedEventId)) {
    throw new Error('Invalid event ID')
  }
  
  const response = await api.get(`/api/events/${parsedEventId}/polls`)
  return response.data
}

export const createPoll = async (eventId, pollData) => {
  const parsedEventId = parseInt(eventId)
  if (isNaN(parsedEventId)) {
    throw new Error('Invalid event ID')
  }
  
  const response = await api.post(`/api/events/${parsedEventId}/polls`, pollData)
  return response.data
}

export const updatePoll = async (eventId, pollId, pollData) => {
  const parsedEventId = parseInt(eventId)
  const parsedPollId = parseInt(pollId)
  if (isNaN(parsedEventId) || isNaN(parsedPollId)) {
    throw new Error('Invalid event ID or poll ID')
  }
  
  const response = await api.put(`/api/events/${parsedEventId}/polls/${parsedPollId}`, pollData)
  return response.data
}

export const deletePoll = async (eventId, pollId) => {
  const parsedEventId = parseInt(eventId)
  const parsedPollId = parseInt(pollId)
  if (isNaN(parsedEventId) || isNaN(parsedPollId)) {
    throw new Error('Invalid event ID or poll ID')
  }
  
  const response = await api.delete(`/api/events/${parsedEventId}/polls/${parsedPollId}`)
  return response.data
}

export const submitPollVote = async (eventId, pollId, voteData) => {
  const parsedEventId = parseInt(eventId)
  const parsedPollId = parseInt(pollId)
  if (isNaN(parsedEventId) || isNaN(parsedPollId)) {
    throw new Error('Invalid event ID or poll ID')
  }
  
  const response = await api.post(`/api/events/${parsedEventId}/polls/${parsedPollId}/votes`, voteData)
  return response.data
}

export const getPollResults = async (eventId, pollId) => {
  const parsedEventId = parseInt(eventId)
  const parsedPollId = parseInt(pollId)
  if (isNaN(parsedEventId) || isNaN(parsedPollId)) {
    throw new Error('Invalid event ID or poll ID')
  }
  
  const response = await api.get(`/api/events/${parsedEventId}/polls/${parsedPollId}/results`)
  return response.data
}

// Invite endpoints
export const createInvite = async (eventId, name, allowGuest = false) => {
  const parsedEventId = parseInt(eventId)
  if (isNaN(parsedEventId)) throw new Error('Invalid event ID')
  const response = await api.post(`/api/events/${parsedEventId}/invites`, {
    name: name || null,
    allowGuest: !!allowGuest,
  })
  return response.data
}

export const getInvites = async (eventId) => {
  const parsedEventId = parseInt(eventId)
  if (isNaN(parsedEventId)) throw new Error('Invalid event ID')
  const response = await api.get(`/api/events/${parsedEventId}/invites`)
  return response.data
}

export const viewInvite = async (token) => {
  const response = await api.get(`/api/invites/${token}`)
  return response.data
}

export const deleteInvite = async (eventId, inviteId) => {
  const parsedEventId = parseInt(eventId)
  const parsedInviteId = parseInt(inviteId)
  if (isNaN(parsedEventId) || isNaN(parsedInviteId)) throw new Error('Invalid ID')
  const response = await api.delete(`/api/events/${parsedEventId}/invites/${parsedInviteId}`)
  return response.data
}

export default api

