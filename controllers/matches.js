const matchesRouter = require('express').Router()
const dgQueries = require('./dgQueries')
const pool = require('../utils/db')

// TODO: Figure out the correct way to close the connection to the database

//add a match to the database
matchesRouter.post('/', async (req, res) => {
  const client = await pool.connect()

  // TODO: Save also the user and the date to the table

  try {
    const { match_id, player1, player2, score1, score2, groupname, finished } = req.body
    const newMatch = await client.query(
      `INSERT INTO matches (match_id, player1, player2, score1, score2, groupid, finished)
        SELECT $1, $2, $3, $4, $5, gp.groupid, $7
        FROM groups AS gp
        WHERE gp.groupname = $6
      ON CONFLICT (match_id) DO UPDATE
      SET score1 = $4, score2 = $5, finished = $7
      RETURNING *`,
      [match_id, player1, player2, score1, score2, groupname, finished]
    )
    res.json(newMatch.rows[0])
  } catch (e) {
    console.error('An error is catched in matchesRouter.post')
    console.error(e.message)
  } finally {
    client.release()
  }
})

// get match IDs acc. to user id and event name from dailygammon
matchesRouter.get('/matchid', async (req, res) => {
  const { uid, event } = req.query

  const matchIds = await dgQueries.getMatchIdsFromDg(uid, event)
  if (Array.isArray(matchIds)) {
    res.json({ matchIds })
  } else {
    res.send(matchIds)
  }
})

//get match result acc. to match ID from dailygammon
matchesRouter.get('/:id', async (req, res) => {
  const result = await dgQueries.getMatchResultFromDg(req.params.id)
  res.json(result)
})

module.exports = matchesRouter
