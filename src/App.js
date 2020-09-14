import React, { useState } from 'react'
import Header from './components/Header'
import Notification from './components/Notification'
import Main from './components/Main'

function App() {
  const [notifMessage, setNotifMessage] = useState('')

  return (
    <div>
      <Header/>
      <Notification notifMessage={notifMessage} />
      <Main setNotifMessage={setNotifMessage} />
    </div>
  )
}

export default App
