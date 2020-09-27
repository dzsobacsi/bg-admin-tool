const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const pool = require('../utils/db')
const loginRouter = require('express').Router()
const config = require('../utils/config')

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body
  try {
    let user = await pool.query(
      `SELECT * FROM users
      WHERE username = $1`,
      [username]
    )
    user = user.rows[0]
    //console.log(user)

    const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(password, user.passwordhash)

    if (!user || !passwordCorrect) {
      return res.status(401).json({
        error: 'invalid username or password'
      })
    }

    const userForToken = {
      username: user.username
    }

    const token = jwt.sign(userForToken, config.SECRET)

    res.status(200).send({ token, username: user.username })
  } catch (e) {
    console.error("Login router error")
    console.error(e.message)
  }
})

module.exports = loginRouter
