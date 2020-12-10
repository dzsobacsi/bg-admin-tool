const playersRouter = require('express').Router()
const dgQueries = require('./dgQueries')
const pool = require('../utils/db')
const bcrypt = require('bcrypt')

//add a player to the database
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

//get player

// TODO: Get player info from the database only,
// return the complete row
playersRouter.get('/:username', async (req, res) => {
  // Check if player is in the database
  const client = await pool.connect()
  try {
    const dbRespnse = await client.query(
      'SELECT user_id FROM players WHERE username = $1',
      [req.params.username]
    )
    if (dbRespnse.rows.length) {
      //console.log('response sent from the database')
      res.send(dbRespnse.rows[0].user_id.toString())
    }  else {

      //If it is not in the database, check it on dailygammon
      //userId is an integer if found and a string otherwise
      const userId = await dgQueries.getPlayerIdFromDg(req.params.username)

      // If found on dailygammon, save it to the database
      if (parseInt(userId)) {
        try {
          const newPlayer = await client.query(
            `INSERT INTO players (user_id, username)
            VALUES ($1, $2)
            RETURNING *`,
            [userId, req.params.username]
          )
          console.log(`${JSON.stringify(newPlayer.rows[0])} is added to the database`)
        } catch (e) {
          console.error(`${req.params.username} could not be saved to database`)
          console.error(e.message)
        } finally {
          res.send(userId)
        }
      } else {
        res.send(userId) // If not found, userId is a string
      }
    }
  } catch (e) {
    console.error('An error is catched in playersRouter.get')
    console.error(e.message)
  } finally {
    client.release()
  }
})

module.exports = playersRouter
