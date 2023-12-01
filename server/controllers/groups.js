const groupsRouter = require('express').Router()
const client = require('../utils/gbq')
const { DATASET, PROJECTID } = require('../utils/config')

// add a new group to the database
// groupname and season are mandatory
// winner is optional but if given, it must be a valid username
// winner is received as the name of the winner, but saved as its ID
groupsRouter.post('/', async (req, res) => {
  const { groupname, winner, season } = req.body
  try {
    if(!groupname || !season) {
      res.status(400)
      res.send({ message: 'Error: Cannot add a group. Groupname or season is missing' })
      res.end()
    }
    else {
      let winnerId = null
      if(winner) {
        const options = {
          query:
            `SELECT user_id
            FROM \`${PROJECTID}.${DATASET}.players\`
            WHERE username = @winner;`,
          params: { winner }
        }
        const [job] = await client.createQueryJob(options)
        const [rows] = await job.getQueryResults()
        winnerId = rows.length
          ? rows[0].user_id
          : null
      }
      if(winner && !winnerId) {
        res.status(400)
        res.send({ message: `Error: Cannot update the group with the given winner. ${winner} does not exist in the database.` })
        res.end()
      }
      else {
        const options = {
          query:
            `MERGE INTO \`${PROJECTID}.${DATASET}.groups\` AS target
            USING(
              SELECT
                @groupname AS groupname,
                @finished AS finished,
                @winnerId AS winner,
                @season AS season,
                CURRENT_TIMESTAMP() AS lastupdate
            ) AS source
            ON target.groupname = source.groupname
            WHEN MATCHED THEN
              UPDATE SET
                finished = source.finished,
                winner = source.winner,
                lastupdate = source.lastupdate
            WHEN NOT MATCHED THEN
              INSERT (groupname, groupid, finished, season, lastupdate)
              VALUES(
                source.groupname,
                GENERATE_UUID(),
                false,
                source.season,
                source.lastupdate
              );

            SELECT * FROM \`${PROJECTID}.${DATASET}.groups\`
            WHERE groupname = @groupname;`,
          params: {
            groupname,
            finished: !!winnerId,
            winnerId,
            season
          },
          types: {
            groupname: 'STRING',
            finished: 'BOOL',
            winnerId: 'INT64',
            season: 'INT64'
          }
        }
        const [job] = await client.createQueryJob(options)
        const [rows] = await job.getQueryResults()
        res.json(rows[0])
      }
    }
  } catch (e) {
    console.error('An error is catched in groupsRouter.post')
    console.error(e.message)
  }
})

//get all groups from the database
groupsRouter.get('/', async (req, res) => {
  const options = {
    query:
      `SELECT gp.groupname, gp.finished, gp.season, gp.lastupdate, pl.username AS winner
      FROM \`${PROJECTID}.${DATASET}.groups\` AS gp
      LEFT JOIN \`${PROJECTID}.${DATASET}.players\` AS pl
      ON gp.winner = pl.user_id`
  }
  try {
    const [job] = await client.createQueryJob(options)
    const [rows] = await job.getQueryResults()
    res.json(rows)
  }
  catch (e) {
    console.error('An error is catched in groupsRouter.get/')
    console.error(e.message)
  }
})

module.exports = groupsRouter
