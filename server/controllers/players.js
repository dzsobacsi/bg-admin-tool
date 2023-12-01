const playersRouter = require('express').Router()
const dgQueries = require('./dgQueries')
const client = require('../utils/gbq')
const bcrypt = require('bcrypt')
const { DATASET, PROJECTID } = require('../utils/config')

// add a player to the database
// or update it whith passwordhash and email address
// Takes: username*, password, email
playersRouter.post('/', async (req, res) => {
  try {
    const { username, password, email } = req.body
    if (!username) {
      res.status(400)
      res.send({ message: 'Error: Cannot add a new player. Username is missing.' })
      res.end()
    }
    else {
      //user_id is a string-number if found and a text otherwise
      const user_id = await dgQueries.getPlayerIdFromDg(username)

      if (parseInt(user_id)) {  // if user_id can be converted to a number, i.e. the user exists in DG
        const passwordHash = password
          ? await bcrypt.hash(password, 10)
          : null

        const options = {
          query:
            `MERGE INTO \`${PROJECTID}.${DATASET}.players\` AS target
            USING (
              SELECT
                @user_id AS user_id,
                @username AS username,
                @passwordHash AS passwordhash,
                false AS administrator,
                @email AS email,
                CURRENT_TIMESTAMP() AS registeredwhen
            ) AS source
            ON target.user_id = source.user_id
            WHEN MATCHED THEN
              UPDATE SET
                passwordhash = source.passwordhash,
                email = source.email,
                registeredwhen = source.registeredwhen
            WHEN NOT MATCHED THEN
              INSERT (user_id, username, passwordhash, administrator, email, registeredwhen)
              VALUES (
                source.user_id,
                source.username,
                source.passwordhash,
                source.administrator,
                source.email,
                source.registeredwhen
              );
            SELECT * FROM \`${PROJECTID}.${DATASET}.players\` WHERE user_id = @user_id;`,
          params: {
            user_id: parseInt(user_id),
            username,
            passwordHash,
            email: email ? email : null
          },
          types: {
            user_id: 'INT64',
            username: 'STRING',
            passwordHash: 'STRING',
            email: 'STRING'
          }
        }
        const [job] = await client.createQueryJob(options)
        const [rows] = await job.getQueryResults()
        res.json(rows[0])
      } else {
        res.status(400)
        res.send({ message: `Error: No user ${username} exists in DailyGammon.` })
        res.end()
      }
    }
  }
  catch (e) {
    console.error('An error is catched in playersRouter.post')
    console.error(e.message)
    res.send(e.message)
  }
})

//get a player from the database
playersRouter.get('/:username', async (req, res) => {
  const options = {
    query:
      `SELECT user_id, username, administrator, passwordhash IS NOT NULL AS registered
      FROM \`${PROJECTID}.${DATASET}.players\`
      WHERE username = @username`,
    params: { username: req.params.username }
  }
  try {
    const [job] = await client.createQueryJob(options)
    const [rows] = await job.getQueryResults()
    if (rows.length) {
      res.send(rows[0])
    } else {
      res.status(404)
      res.send({ message: `Error: There is no user ${req.params.username} in the database` })
    }
  }
  catch (e) {
    console.error('An error is catched in playersRouter.get')
    console.error(e.message)
    res.send(e.message)
  }
})

module.exports = playersRouter
