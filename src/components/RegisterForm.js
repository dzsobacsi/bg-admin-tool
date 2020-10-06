import React, { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import registerService from '../services/register'

const RegisterForm = ({ toggleRegisterVisible, setNotifMessage }) => {
  const [warningText, setWarningText] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    const eparams = {
      username: e.target.username.value,
      password1: e.target.password1.value,
      password2: e.target.password2.value,
    }
    const user = {
      uname: eparams.username,
      passwd: eparams.password1,
    }
    if (eparams.password1 !== eparams.password2) {

      //Check if the two given passwords are the same
      setWarningText('The two passwords are not the same, try again')
      setTimeout(() => setWarningText(''), 4000)
    } else {

      //Check if the username is taken
      const userFromDb = await registerService.getUser(user.uname)
      const isTaken = !!userFromDb.data
      if (isTaken) {
        setWarningText('This username is already taken, choose another one')
        setTimeout(() => setWarningText(''), 4000)
      } else {

        // if everything is OK
        await registerService.register(user)
        setNotifMessage(`${user.uname} is now registered. Please, log in.`)
        toggleRegisterVisible()
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
