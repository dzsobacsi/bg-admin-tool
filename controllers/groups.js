const groupsRouter = require('express').Router()
const pool = require('../utils/db')

// add a new group to the database
groupsRouter.post('/', async (req, res) => {
  const { groupname, finished, winner } = req.body
  const client = await pool.connect()
  try {
    const groups = await client.query(
      `INSERT INTO groups (groupname, finished, winner)
        SELECT $1, $2, pl.user_id
        FROM players AS pl
        WHERE pl.username = $3
      ON CONFLICT (groupname) DO UPDATE
      SET finished = $2, winner = (
        SELECT user_id
        FROM players
        WHERE username = $3
      )
      RETURNING *`,
      [groupname, finished, winner]
    )
    res.json(groups.rows)
  } catch (e) {
    console.error('An error is catched in groupsRouter.post')
    console.error(e.message)
  } finally {
    client.release()
  }
})

//get all groupnames from the database
groupsRouter.get('/groupnames', async (req, res) => {
  const client = await pool.connect()
  try {
    const groups = await client.query(
      `SELECT * FROM groups
      LEFT JOIN players
      ON groups.winner = players.user_id`
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
      `SELECT mt.match_id, p1.username AS player1, p2.username AS player2, mt.score1, mt.score2, mt.finished
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
