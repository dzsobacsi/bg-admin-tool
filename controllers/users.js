const bcrypt = require('bcrypt')
const pool = require('../utils/db')
const usersRouter = require('express').Router()

// add a user
usersRouter.post('/', async (req, res) => {
  const { uname, passwd } = req.body
  if (!uname || !passwd || uname.length < 3 || passwd.length < 3 ) {
    res.status(400).json({ error: 'Username and password must have at least 3 characters' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(passwd, saltRounds)

  try {
    const newUser = await pool.query(
      `INSERT INTO users (username, passwordhash)
      VALUES ($1, $2)
      RETURNING *`,
      [uname, passwordHash]
    )
    res.json(newUser.rows[0])
  } catch (e) {
    console.error(e.message)
    pool.end()
  }

})

//get a user
usersRouter.get('/:username', async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT * FROM users
      WHERE username = $1`,
      [req.params.username]
    )
    res.json(user.rows[0])
  } catch (e) {
    console.error(e.message)
    pool.end()
  }
})

module.exports = usersRouter
