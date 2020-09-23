import React, { useState } from 'react'
import Header from './components/Header'
import Notification from './components/Notification'
import Main from './components/Main'

function App() {
  const [notifMessage, setNotifMessage] = useState('Loading...')

  return (
    <div>
      <Header/>
      <Main setNotifMessage={setNotifMessage} />
      <Notification notifMessage={notifMessage} />
    </div>
  )
}

export default App
