import React, { useState } from 'react'
import Header from './components/Header'
import Notification from './components/Notification'
import Main from './components/Main'

function App() {
  const [notifMessage, setNotifMessage] = useState('Loading...')
  const [adminMode, setAdminMode] = useState(
    !!window.localStorage.getItem('login-cookie')
  )

  return (
    <div>
      <Header
        setNotifMessage={setNotifMessage}
        adminMode={adminMode}
        setAdminMode={setAdminMode}
      />
      <Main setNotifMessage={setNotifMessage} adminMode={adminMode}/>
      <Notification notifMessage={notifMessage} />
    </div>
  )
}

export default App
