import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Notification from './components/Notification'
import Main from './components/Main'
import { isAdministrator } from './services/helperfunctions'

function App() {
  const [notifMessage, setNotifMessage] = useState('Loading...')
  const [adminMode, setAdminMode] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState(
    window.localStorage.getItem('username')
  )

  useEffect(() => {
    (async () => {
      if (loggedInUser && await isAdministrator(loggedInUser)) {
        setAdminMode(true)
      } else {
        setAdminMode(false)
      }
    })()
  }, [loggedInUser])

  return (
    <div>
      <Header
        setNotifMessage={setNotifMessage}
        adminMode={adminMode}
        loggedInUser={loggedInUser}
        setLoggedInUser={setLoggedInUser}
      />
      <Main setNotifMessage={setNotifMessage} adminMode={adminMode}/>
      <Notification notifMessage={notifMessage} />
    </div>
  )
}

export default App
