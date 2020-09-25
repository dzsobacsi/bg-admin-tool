import React from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import loginService from '../services/login'

const LoginForm = ({ adminMode, setAdminMode, setNotifMessage }) => {
  const handleLogin = async (e) => {
    e.preventDefault()
    const user = {
      login: e.target.username.value,
      password: e.target.password.value,
    }
    const loginResponse = await loginService.login(user)
    if (loginResponse.data) {
      window.localStorage.setItem('login-cookie', loginResponse.data)
      setAdminMode(!adminMode)
      setNotifMessage('Successful login')
    } else {
      setNotifMessage('Wrong credentials')
    }
  }

  const handleLogout = () => {
    setAdminMode(!adminMode)
    setNotifMessage('User logged out')
    window.localStorage.clear()
  }

  return (
    <>
      {adminMode === false &&
        <Form inline onSubmit={handleLogin}>
          <Form.Control
            className="smaller-form"
            type="text"
            placeholder="username"
            name="username"
          />&nbsp;
          <Form.Control
            className="smaller-form"
            type="password"
            placeholder="password"
            name="password"
          />&nbsp;
          <Button
            className="smaller-form"
            variant="success"
            size="sm"
            type="submit">
            Login
          </Button>
        </Form>
      }
      {adminMode === true &&
        <Button
          className="smaller-form"
          variant="success"
          size="sm"
          onClick={handleLogout}>
          Logout
        </Button>
      }
    </>
  )
}

export default LoginForm
