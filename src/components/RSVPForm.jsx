import { useState } from 'react'
import { submitRSVP } from '../services/api'

function RSVPForm({ eventId, onRSVPSuccess }) {
  const [name, setName] = useState('')
  const [bringingDish, setBringingDish] = useState(false)
  const [dishes, setDishes] = useState([''])
  const [whiteElephant, setWhiteElephant] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (bringingDish) {
      const validDishes = dishes.filter(dish => dish.trim())
      if (validDishes.length === 0) {
        setError('Please enter at least one dish name')
        return
      }
    }

    if (!eventId) {
      setError('Event ID is missing')
      return
    }

    try {
      setLoading(true)
      const rsvpData = {
        name: name.trim(),
        bringingDish: bringingDish,
        dishes: bringingDish ? dishes.filter(dish => dish.trim()) : [],
        whiteElephant: whiteElephant
      }

      await submitRSVP(eventId, rsvpData)
      
      setSuccess(true)
      setName('')
      setBringingDish(false)
      setDishes([''])
      setWhiteElephant(false)
      
      if (onRSVPSuccess) {
        onRSVPSuccess()
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error submitting RSVP:', err)
      setError(err.response?.data?.message || 'Failed to submit RSVP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validDishes = dishes.filter(dish => dish.trim())
  const isFormValid = name.trim() && (!bringingDish || validDishes.length > 0)

  const handleDishChange = (index, value) => {
    const newDishes = [...dishes]
    newDishes[index] = value
    setDishes(newDishes)
    setError('')
  }

  const addDish = () => {
    setDishes([...dishes, ''])
  }

  const removeDish = (index) => {
    if (dishes.length > 1) {
      const newDishes = dishes.filter((_, i) => i !== index)
      setDishes(newDishes)
      setError('')
    }
  }

  return (
    <section className="rsvp-form-section">
      <h2>RSVP Here</h2>
      <form onSubmit={handleSubmit} className="rsvp-form">
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            onFocus={() => setError('')}
            placeholder="Enter your name"
            className="name-input"
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={bringingDish}
              onChange={(e) => {
                setBringingDish(e.target.checked)
                if (!e.target.checked) {
                  setDishes([''])
                }
              }}
              className="dish-checkbox"
            />
            <span>I'm bringing a dish</span>
          </label>
          {bringingDish && (
            <div className="dishes-container">
              {dishes.map((dish, index) => (
                <div key={index} className="dish-input-row">
                  <input
                    type="text"
                    value={dish}
                    onChange={(e) => handleDishChange(index, e.target.value)}
                    onFocus={() => setError('')}
                    placeholder={`Dish ${index + 1} name`}
                    className="dish-name-input"
                  />
                  {dishes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDish(index)}
                      className="remove-dish-button"
                      aria-label="Remove dish"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDish}
                className="add-dish-button"
              >
                + Add Another Dish
              </button>
            </div>
          )}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={whiteElephant}
              onChange={(e) => setWhiteElephant(e.target.checked)}
              className="dish-checkbox"
            />
            <span>I want to participate in white elephant</span>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">RSVP submitted successfully!</div>}

        <button 
          type="submit" 
          className="submit-button"
          disabled={!isFormValid || loading}
        >
          {loading ? 'Submitting...' : 'Submit RSVP'}
        </button>
      </form>
    </section>
  )
}

export default RSVPForm

