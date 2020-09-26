const loginRouter = require('express').Router()
const dgLogin = require('./dgLogin')

loginRouter.post('/', async (req, res) => {
  const { login, password } = req.body
  try {
    const loginResponse = await dgLogin.login(login, password)
    console.log(loginResponse)
    res.json(loginResponse)
  } catch (e) {
    console.error(e.message)
  }
})

module.exports = loginRouter
