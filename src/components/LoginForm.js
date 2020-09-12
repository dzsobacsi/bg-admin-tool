import React from 'react'
import loginService from '../services/login'

const LoginForm = () => {
  const handleLogin = async (e) => {
    e.preventDefault()
    const user = {
      login: e.target.username.value,
      password: e.target.password.value,
    }
    const loginResponse = await loginService.login(user)
    console.log(loginResponse)
  }

  return (
    <div>
      <form onSubmit={handleLogin}>
        username: <input name="username" /><br/>
        password: <input type="password" name="password"/><br/>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
