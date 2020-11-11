const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const pool = require('../utils/db')
const loginRouter = require('express').Router()
const config = require('../utils/config')

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body
  const client = await pool.connect()
  try {
    let user = await client.query(
      `SELECT * FROM users
      WHERE username = $1`,
      [username]
    )
    user = user.rows[0]
    //console.log('user: ', user)

    const passwordCorrect = !user
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

    res.status(200).send({ token, username: user.username, userid: user.uid })
  } catch (e) {
    console.error('Login router error')
    console.error(e.message)
  } finally {
    client.release()
  }
})

module.exports = loginRouter
