import React, { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import RegisterForm from './RegisterForm'
import loginService from '../services/login'

const LoginForm = ({ loggedInUser, setLoggedInUser, setNotifMessage }) => {
  const [registerVisble, setRegisterVisible] = useState(false)

  const toggleRegisterVisible = () => setRegisterVisible(!registerVisble)

  const handleLogin = async (e) => {
    e.preventDefault()
    const user = {
      username: e.target.username.value,
      password: e.target.password.value,
    }
    const loginResponse = await loginService.login(user)
    if (loginResponse) {
      const user = loginResponse.data
      window.localStorage.setItem('token', user.token)
      window.localStorage.setItem('username', user.username)
      window.localStorage.setItem('userid', user.userid)

      setNotifMessage(`${user.username} logged in`)
      setLoggedInUser(user.username)
    } else {
      setNotifMessage('Wrong credentials')
    }
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    setNotifMessage('User logged out')
    window.localStorage.clear()
  }

  return (
    <>
      {!loggedInUser &&
        <><Form inline onSubmit={handleLogin}>
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
            type="submit"
          >
            Login
          </Button>&nbsp;

          <Button
            className="smaller-form"
            variant="success"
            size="sm"
            onClick={toggleRegisterVisible}
          >
            Register
          </Button>
        </Form>

        <Modal
          show={registerVisble}
          onHide={toggleRegisterVisible}
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <RegisterForm
              toggleRegisterVisible={toggleRegisterVisible}
              setNotifMessage={setNotifMessage}
            />
          </Modal.Body>
        </Modal></>
      }
      {!!loggedInUser &&
        <Button
          className="smaller-form"
          variant="success"
          size="sm"
          onClick={handleLogout}
        >
          Logout
        </Button>
      }
    </>
  )
}

export default LoginForm
