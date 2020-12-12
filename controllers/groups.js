const groupsRouter = require('express').Router()
const pool = require('../utils/db')

// add a new group to the database
groupsRouter.post('/', async (req, res) => {
  const { groupname, finished, winner, season, date } = req.body
  //console.log({ groupname, finished, winner })
  // winner is received as the name of the winner, but saved as its ID
  const client = await pool.connect()
  try {
    const groups = await client.query(
      `INSERT INTO groups (groupname, season, lastupdate)
      VALUES ($1, $4, to_timestamp($5))
      ON CONFLICT (groupname) DO UPDATE
      SET finished = $2, lastupdate = to_timestamp($5), winner = (
        SELECT user_id
        FROM players
        WHERE username = $3
      )
      RETURNING *`,
      [groupname, finished || false, winner, season, date]
    )
    res.json(groups.rows[0])
  } catch (e) {
    console.error('An error is catched in groupsRouter.post')
    console.error(e.message)
  } finally {
    client.release()
  }
})

//get all groups from the database
groupsRouter.get('/', async (req, res) => {
  const client = await pool.connect()
  try {
    const groups = await client.query(
      `SELECT gp.groupname, gp.finished, gp.season, gp.lastupdate, pl.username AS winner
      FROM groups AS gp
      LEFT JOIN players AS pl
      ON gp.winner = pl.user_id`
    )
    res.json(groups.rows)
  } catch (e) {
    console.error('An error is catched in groupsRouter.get/groupnames')
    console.error(e.message)
  } finally {
    client.release()
  }
})

//get matches of a given group from the database
groupsRouter.get('/matches', async (req, res) => {
  const group = req.query.groupname
  const client = await pool.connect()
  try {
    const matches = await client.query(
      `SELECT mt.match_id, p1.username AS player1, p2.username AS player2,
        mt.score1, mt.score2, mt.finished, gp.lastupdate
      FROM matches AS mt
      LEFT JOIN players p1
      ON mt.player1 = p1.user_id
      LEFT JOIN players p2
      ON mt.player2 = p2.user_id
      LEFT JOIN groups gp
      ON mt.groupid = gp.groupid
      WHERE gp.groupname = $1`,
      [group]
    )
    res.json(matches.rows)
  } catch (e) {
    console.error('An error is catched in groupsRouter.get/matches')
    console.error(e.message)
  } finally {
    client.release()
  }
})

module.exports = groupsRouter
