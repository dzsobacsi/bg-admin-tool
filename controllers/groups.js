const groupsRouter = require('express').Router()
const pool = require('../utils/db')

//get all groupnames from the database
groupsRouter.get('/groupnames', async (req, res) => {
  try {
    const groups = await pool.query('SELECT DISTINCT groupname FROM groups')
    res.json(groups.rows.map(x => x.groupname))
  } catch (e) {
    console.error(e.message)
    pool.end()
  }
})

//get matches of a given group from the database
groupsRouter.get('/matches', async (req, res) => {
  const group = req.query.groupname
  try {
    const matches = await pool.query(
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
    console.error(e.message)
    pool.end()
  }
})

module.exports = groupsRouter
