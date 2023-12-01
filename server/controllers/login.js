const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const client = require('../utils/gbq')
const { JWT_SECRET, PROJECTID, DATASET } = require('../utils/config')

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body
  try {
    const options = {
      query:
        `SELECT * FROM \`${PROJECTID}.${DATASET}.players\`
        WHERE username = @username`,
      params: { username }
    }
    const [job] = await client.createQueryJob(options)
    const [rows] = await job.getQueryResults()
    user = rows[0]

    const passwordCorrect = !user
      ? false
      : await bcrypt.compare(password, user.passwordhash)

    if (!user || !passwordCorrect) {
      return res.status(401).json({
        message: 'Error: Invalid username or password'
      })
    }

    const userForToken = {
      username: user.username
    }

    const token = jwt.sign(userForToken, JWT_SECRET)

    res.status(200).send({ token, username: user.username, userid: user.user_id })
  }
  catch (e) {
    console.error('Login router error')
    console.error(e.message)
  }
})

module.exports = loginRouter
