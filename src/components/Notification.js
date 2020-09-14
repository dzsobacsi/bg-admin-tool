import React from 'react'
import './Notification.css'

const Notification = ({ notifMessage }) => {
  return (
    <div className="Notification">
      {notifMessage}
    </div>
  )
}

export default Notification
