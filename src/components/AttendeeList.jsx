function AttendeeList({ rsvps }) {
  if (rsvps.length === 0) {
    return (
      <section className="attendee-list-section">
        <h2>Attendees</h2>
        <div className="empty-state">
          <p>No RSVPs yet. Be the first to RSVP!</p>
        </div>
      </section>
    )
  }

  return (
    <section className="attendee-list-section">
      <h2>Attendees ({rsvps.length})</h2>
      <div className="attendee-list">
        {rsvps.map((rsvp) => (
          <div key={rsvp.id} className="attendee-card">
            <div className="attendee-name">{rsvp.name}</div>
            <div className="dish-status">
              {rsvp.bringingDish ? (
                <div className="dish-info">
                  {(() => {
                    const dishList = rsvp.dishes || (rsvp.dishName ? [rsvp.dishName] : [])
                    const dishCount = dishList.length
                    return (
                      <>
                        <span className="dish-yes">✓ Bringing {dishCount > 0 ? `${dishCount} dish${dishCount > 1 ? 'es' : ''}` : 'a dish'}</span>
                        {dishCount > 0 && (
                          <div className="dishes-list">
                            {dishList.map((dish, index) => (
                              <span key={index} className="dish-name">{dish}</span>
                            ))}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              ) : (
                <span className="dish-no">Not bringing a dish</span>
              )}
            </div>
            {rsvp.whiteElephant && (
              <div className="white-elephant-status">
                <span className="white-elephant-yes">🎁 Participating in white elephant</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default AttendeeList

