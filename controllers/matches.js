const matchesRouter = require('express').Router()
const dgQueries = require('./dgQueries')
const pool = require('../utils/db')

//add a match to the database
// takes the group name as a string but saves it as its ID (fk)
matchesRouter.post('/', async (req, res) => {
  const client = await pool.connect()

  try {
    const {
      match_id,
      player1,
      player2,
      score1,
      score2,
      groupname,
      finished,
      addedbyuser,
      reversed
    } = req.body
    if(!(match_id && player1 && player2 && score1 && score2 && groupname && finished && reversed)) {
      res.status(400)
      res.json({ message: 'Error: Could not save the match to the database. Some of the required paramaters are missing' })
    } else {
      const newMatch = await client.query(
        `INSERT INTO matches (match_id, player1, player2, score1, score2, groupid,
          finished, addedwhen, addedbyuser, reversed)
        SELECT $1, $2, $3, $4, $5, gp.groupid, $7, NOW(), $8, $9
        FROM groups AS gp
        WHERE gp.groupname = $6
        ON CONFLICT (match_id) DO UPDATE
        SET score1 = $4, score2 = $5, finished = $7
        RETURNING *`,
        [match_id, player1, player2, score1, score2, groupname, finished, addedbyuser, reversed]
      )
      res.json(newMatch.rows[0])
    }
    res.end()
  } catch (e) {
    console.error('An error is catched in matchesRouter.post')
    console.error(e.message)
  } finally {
    client.release()
  }
})

//get matches of a given group from the database
matchesRouter.get('/', async (req, res) => {
  const group = req.query.groupname
  const client = await pool.connect()
  try {
    const matches = await client.query(`
      SELECT mt.match_id, p1.username AS player1, p2.username AS player2,
        mt.score1, mt.score2, mt.finished, mt.reversed, gp.lastupdate
      FROM matches AS mt
      LEFT JOIN players p1
      ON mt.player1 = p1.user_id
      LEFT JOIN players p2
      ON mt.player2 = p2.user_id
      LEFT JOIN groups gp
      ON mt.groupid = gp.groupid
      WHERE gp.groupname = $1
    `, [group])
    if(matches.rows.length)
      res.json(matches.rows)
    else {
      res.status(404)
      res.json({ message: `Error: There are no matches in the database in group ${group}` })
    }
    res.end()
  } catch (e) {
    console.error('An error is catched in groupsRouter.get/matches')
    console.error(e.message)
  } finally {
    client.release()
  }
})

// get match IDs acc. to user id and event name from dailygammon
matchesRouter.get('/matchids', async (req, res) => {
  const { uid, event } = req.query

  const result = await dgQueries.getMatchIdsFromDg(uid, event)
  if (Array.isArray(result)) {
    res.json({ matchIds: result })
  } else {
    res.status(404)
    res.json({ message: result })
  }
  res.end()
})

//get match result acc. to match ID from dailygammon
matchesRouter.get('/:id', async (req, res) => {
  const result = await dgQueries.getMatchResultFromDg(req.params.id)
  if(result.message) res.status(404)
  res.json(result)
  res.end()
})

module.exports = matchesRouter
