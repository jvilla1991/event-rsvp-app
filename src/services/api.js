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

export default api

