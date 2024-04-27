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
        res.send({ message: `Error: Cannot update the group with the given winner. ${winner} does not exist in the database.` })
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
      `select distinct 
        g.groupname,
        g.finished,
        g.season,
        g.lastupdate,
        w.username as winner,
        p.username as players
      from
        "groups" g
      join matches m on g.groupid = m.groupid 
      join players p on m.player1 = p.user_id
      left join players w on g.winner = w.user_id 
      order by g.groupname `
    )
    const result = []
    groups.rows.forEach(group => {
      const existingGroup = result.find(g => g.groupname === group.groupname)
      if(existingGroup) {
        existingGroup.players.push(group.players)
      } else {
        result.push({
          groupname: group.groupname,
          finished: group.finished,
          season: group.season,
          lastupdate: group.lastupdate,
          winner: group.winner,
          players: [group.players]
        })
      }
    })
    res.json(result)
  } catch (e) {
    console.error('An error is catched in groupsRouter.get/groupnames')
    console.error(e.message)
  } finally {
    client.release()
  }
})

module.exports = groupsRouter
