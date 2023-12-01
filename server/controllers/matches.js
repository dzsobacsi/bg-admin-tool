const matchesRouter = require('express').Router()
const dgQueries = require('./dgQueries')
const client = require('../utils/gbq')
const { DATASET, PROJECTID } = require('../utils/config')

//add a match to the database
// takes the group name as a string but saves it as its ID (fk)
matchesRouter.post('/', async (req, res) => {
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
    if(
      [match_id, player1, player2, score1, score2, groupname, finished, reversed]
        .some(x => x === undefined)
    ) {
      res.status(400)
      res.json({ message: 'Error: Could not save the match to the database. Some of the required paramaters are missing' })
    }
    else {
      const options = {
        query:
          `MERGE INTO \`${PROJECTID}.${DATASET}.matches\` AS target
          USING (
            SELECT
              @match_id AS match_id,
              @player1 AS player1,
              @player2 AS player2,
              @score1 AS score1,
              @score2 AS score2,
              gp.groupid AS groupid,
              @finished AS finished,
              CURRENT_TIMESTAMP() AS addedwhen,
              @addedbyuser AS addedbyuser,
              @reversed AS reversed
            FROM \`${PROJECTID}.${DATASET}.groups\` AS gp
            WHERE gp.groupname = @groupname
          ) AS source
          ON target.match_id = source.match_id
          WHEN MATCHED THEN
            UPDATE SET
              score1 = @score1,
              score2 = @score2,
              finished = @finished
          WHEN NOT MATCHED THEN
            INSERT (
              match_id,
              player1,
              player2,
              score1,
              score2,
              groupid,
              finished,
              addedwhen,
              addedbyuser,
              reversed
            )
            VALUES(
              source.match_id,
              source.player1,
              source.player2,
              source.score1,
              source.score2,
              source.groupid,
              source.finished,
              source.addedwhen,
              source.addedbyuser,
              source.reversed
            );

            SELECT * FROM \`${PROJECTID}.${DATASET}.matches\`
            WHERE match_id = @match_id;`,
        params: {
          match_id, player1, player2, score1, score2, groupname, finished, addedbyuser, reversed
        }
      }
      const [job] = await client.createQueryJob(options)
      const [rows] = await job.getQueryResults()
      res.json(rows[0])
    }
    res.end()
  }
  catch (e) {
    console.error('An error is catched in matchesRouter.post')
    console.error(e.message)
  }
})

//get matches of a given group from the database
matchesRouter.get('/', async (req, res) => {
  const group = req.query.groupname
  const options = {
    query:
      `SELECT mt.match_id, p1.username AS player1, p2.username AS player2,
        mt.score1, mt.score2, mt.finished, mt.reversed, gp.lastupdate
      FROM \`${PROJECTID}.${DATASET}.matches\` AS mt
      LEFT JOIN \`${PROJECTID}.${DATASET}.players\` p1
      ON mt.player1 = p1.user_id
      LEFT JOIN \`${PROJECTID}.${DATASET}.players\` p2
      ON mt.player2 = p2.user_id
      LEFT JOIN \`${PROJECTID}.${DATASET}.groups\` gp
      ON mt.groupid = gp.groupid
      WHERE gp.groupname = @group`,
    params: { group }
  }
  try {
    const [job] = await client.createQueryJob(options)
    const [rows] = await job.getQueryResults()
    if(rows.length)
      res.json(rows)
    else {
      res.status(404)
      res.json({ message: `Error: There are no matches in the database in group ${group}` })
    }
    res.end()
  }
  catch (e) {
    console.error('An error is catched in matchesRouter.get/')
    console.error(e.message)
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
