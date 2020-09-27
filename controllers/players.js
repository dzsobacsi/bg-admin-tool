const playersRouter = require('express').Router()
const dgQueries = require('./dgQueries')
const pool = require('../utils/db')

// TODO: Figure out the correct way to close the connection to the database

//add a player to the database
playersRouter.post('/', async (req, res) => {
  try {
    const { user_id, username } = req.body
    const newPlayer = await pool.query(
      `INSERT INTO players (user_id, username)
      VALUES ($1, $2)
      RETURNING *`,
      [user_id, username]
    )
    res.json(newPlayer.rows[0])
  } catch (e) {
    console.error(e.message)
    pool.end()
  }
})

//get player ID
playersRouter.get('/:username', async (req, res) => {
  // Check if player is in the database
  try {
    const dbRespnse = await pool.query(
      `SELECT user_id FROM players WHERE username = $1`,
      [req.params.username]
    )
    if (dbRespnse.rows.length) {
      //console.log('response sent from the database')
      res.send(dbRespnse.rows[0].user_id.toString())
    }  else {

      //If it is not in the database, check it on dailygammon
      const userId = await dgQueries.getPlayerIdFromDg(req.params.username)

      // If found on dailygammon, save it to the database
      if (parseInt(userId)) {
        try {
          const newPlayer = await pool.query(
            `INSERT INTO players (user_id, username)
            VALUES ($1, $2)
            RETURNING *`,
            [userId, req.params.username]
          )
          console.log(`${JSON.stringify(newPlayer.rows[0])} is added to the database`)
        } catch (e) {
          console.error(`${req.params.username} could not be saved to database`)
          console.error(e.message)
          pool.end()
        } finally {
          //console.log('response sent from dailygammon')
          res.send(userId)
        }
      } else {
        res.send(userId)
      }
    }
  } catch (e) {
    console.error('UserId could not be fetched from the database')
    console.error(e.message)
    pool.end()
  }
})

module.exports = playersRouter