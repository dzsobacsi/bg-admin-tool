import React from 'react'
import LoginForm from './LoginForm'

const Header = ({ adminMode, setAdminMode, setNotifMessage }) => {
  return (
    <div className="Header">
      <div className="header-1">
        Backgammon Championship
      </div>
      <div className="header-3">
        <LoginForm
          adminMode={adminMode}
          setAdminMode={setAdminMode}
          setNotifMessage={setNotifMessage}
        />
      </div>
    </div>
  )
}

export default Header
