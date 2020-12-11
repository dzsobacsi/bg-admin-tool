const playersRouter = require('express').Router()
const dgQueries = require('./dgQueries')
const pool = require('../utils/db')
const bcrypt = require('bcrypt')

// add a player to the database
// or update it whith passwordhash and email address
// Takes: username*, password, email

// This is currently not used for anything
playersRouter.post('/', async (req, res) => {
  const client = await pool.connect()
  try {
    const { username, password, email } = req.body
    if (!username) {
      throw { message: 'Error: Cannot add a new player. Username is missing.' }
    }

    //user_id is a string-number if found and a text otherwise
    const user_id = await dgQueries.getPlayerIdFromDg(username)

    if (parseInt(user_id)) {  // if user_id can be converted to a number, i.e. the user exists in DG
      const passwordHash = password
        ? await bcrypt.hash(password, 10)
        : null

      const newPlayer = await client.query(
        `INSERT INTO players (user_id, username, passwordhash, administrator, email, registeredwhen)
        VALUES ($1, $2, $3, false, $4, NOW())
        ON CONFLICT (username) DO UPDATE
        SET passwordhash = $3, email = $4, registeredwhen = NOW()
        RETURNING *`,
        [user_id, username, passwordHash, email]
      )
      res.json(newPlayer.rows[0])
    } else {
      throw { message: user_id }
    }
  } catch (e) {
    console.error('An error is catched in playersRouter.post')
    console.error(e.message)
    res.send(e.message)
  } finally {
    client.release()
  }
})

//get a player from the database
playersRouter.get('/:username', async (req, res) => {
  // Check if player is in the database
  const client = await pool.connect()
  try {
    const dbRespnse = await client.query(
      `SELECT user_id, username, administrator, passwordhash IS NOT NULL AS registered
      FROM players
      WHERE username = $1`,
      [req.params.username]
    )
    if (dbRespnse.rows.length) {
      res.send(dbRespnse.rows[0])
    } else {
      throw { message: `Error: There is no user ${req.params.username} in the database` }
    }
  } catch (e) {
    console.error('An error is catched in playersRouter.get')
    console.error(e.message)
    res.send(e.message)
  } finally {
    client.release()
  }
})

module.exports = playersRouter
