import { useState } from 'react'
import RSVPForm from './components/RSVPForm'
import AttendeeList from './components/AttendeeList'
import './App.css'

function App() {
  const [rsvps, setRsvps] = useState([])
  const [showAttendees, setShowAttendees] = useState(false)

  const handleAddRSVP = (name, bringingDish, dishes = [], whiteElephant = false) => {
    const newRSVP = {
      id: Date.now(),
      name: name.trim(),
      bringingDish: bringingDish,
      dishes: dishes,
      whiteElephant: whiteElephant
    }
    setRsvps([...rsvps, newRSVP])
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Christmas Event RSVP</h1>
        <div className="event-address">
          <p className="address-label">Event Location:</p>
          <a 
            href="https://www.google.com/maps/search/?api=1&query=19789+Merriman+Rd,+Livonia,+MI+48152"
            target="_blank"
            rel="noopener noreferrer"
            className="address-link"
          >
            <span className="address-text">📍 19789 Merriman Rd, Livonia, MI 48152</span>
            <span className="address-hint">Click to open in Google Maps →</span>
          </a>
        </div>
      </header>
      
      <main className="app-main">
        <RSVPForm onAddRSVP={handleAddRSVP} />
        <div className="attendees-toggle-section">
          <button
            onClick={() => setShowAttendees(!showAttendees)}
            className="toggle-attendees-button"
          >
            {showAttendees ? 'Hide' : 'Show'} Attendees ({rsvps.length})
          </button>
          {showAttendees && <AttendeeList rsvps={rsvps} />}
        </div>
      </main>
    </div>
  )
}

export default App

