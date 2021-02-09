const groupsRouter = require('express').Router()
const pool = require('../utils/db')

// add a new group to the database
// groupname and season are mandatory
// winner is optional but if given, it must be a valid username
// winner is received as the name of the winner, but saved as its ID
groupsRouter.post('/', async (req, res) => {
  const { groupname, winner, season } = req.body
  const client = await pool.connect()
  try {
    if(!groupname || !season) {
      res.status(400)
      res.send({ message: 'Error: Cannot add a group. Groupname or season is missing' })
      res.end()
    } else {
      let winnerId = null
      if(winner) {
        const dbResponse = await client.query(`
          SELECT user_id
          FROM players
          WHERE username = $1;
        `, [winner])
        winnerId = dbResponse.rows.length
          ? dbResponse.rows[0].user_id
          : null
      }
      if(winner && !winnerId) {
        res.status(400)
        res.send({ message: 'Error: Cannot update the group with the given winner. nonexistinguser does not exist in the database.' })
        res.end()
      } else {
        const groups = await client.query(`
          INSERT INTO groups (groupname, season, lastupdate)
          VALUES ($1, $4, NOW())
          ON CONFLICT (groupname) DO UPDATE
          SET finished = $2, lastupdate = NOW(), winner = $3
          RETURNING *
        `, [groupname, !!winnerId, winnerId, season])
        res.json(groups.rows[0])
      }
    }
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

module.exports = groupsRouter
