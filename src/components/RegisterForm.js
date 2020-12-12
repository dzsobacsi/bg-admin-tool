import React, { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import dbService from '../services/services'

const RegisterForm = ({ toggleRegisterVisible, setNotifMessage }) => {
  const [warningText, setWarningText] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    const eparams = {
      username: e.target.username.value,
      password1: e.target.password1.value,
      password2: e.target.password2.value,
      email: e.target.email.value,
    }
    const user = {
      username: eparams.username,
      password: eparams.password1,
      email: eparams.email,
    }
    if (user.username.length < 3) {
      setWarningText('The username must have at least 3 characters')
      setTimeout(() => setWarningText(''), 4000)
    }
    else if (user.password.length < 6) {
      setWarningText('The password must have at least 6 characters')
      setTimeout(() => setWarningText(''), 4000)
    }
    else if (eparams.password1 !== eparams.password2) {
      //Check if the two given passwords are not the same
      setWarningText('The two passwords are not the same, try again')
      setTimeout(() => setWarningText(''), 4000)
    } else {

      //Check if the user is already registered
      const userFromDb = await dbService.getUser(user.username)
      if (userFromDb.data.registered) {
        setWarningText('You already registered. Please, log in.')
        setTimeout(() => setWarningText(''), 4000)
      } else {

        // if everything is OK
        const addedUser = await dbService.register(user)
        if (addedUser.data.user_id) {
          setNotifMessage(`${user.username} is now registered. Please, log in.`)
          toggleRegisterVisible()
        } else {
          setWarningText(
            `${user.username} is not a player of DailyGammon.
            Please, use the same username that you use on DailyGammon.`
          )
          setTimeout(() => setWarningText(''), 5500)
        }
      }
    }
  }

  return (
    <Form onSubmit={handleRegister}>
      <span style={{ color: 'red' }} display={warningText ? 'inline' : 'none'}>
        {warningText}
      </span>
      <Form.Group as={Row}>
        <Form.Label column sm={4}>username: </Form.Label>
        <Col sm={8}>
          <Form.Control
            type="text"
            name="username"
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row}>
        <Form.Label column sm={4}>password: </Form.Label>
        <Col sm={8}>
          <Form.Control
            type="password"
            name="password1"
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row}>
        <Form.Label column sm={4}>password again: </Form.Label>
        <Col sm={8}>
          <Form.Control
            type="password"
            name="password2"
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row}>
        <Form.Label column sm={4}>e-mail (optional): </Form.Label>
        <Col sm={8}>
          <Form.Control
            type="text"
            name="email"
          />
        </Col>
      </Form.Group>

      <Button variant="primary" type="submit">
        Register
      </Button>&nbsp;
      <Button variant="secondary" onClick={toggleRegisterVisible}>
        Cancel
      </Button>

    </Form>
  )
}

export default RegisterForm
