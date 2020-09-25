const express = require('express')
const favicon = require('express-favicon')
const path = require('path')
const cors = require('cors')
const morgan = require('morgan')
const pool = require('./db')
const config = require('./config')
const dgQueries = require('./dgQueries')
const dgLogin = require('./dgLogin')
const app = express()

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())
app.use(favicon(__dirname + '/build/favicon.ico'))
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'build')))

// Temporary TESTs
//dgQueries.getPlayerIdFromDg('dzsobacsi').then(res => console.log(res))

// dgQueries.getMatchIdsFromDg(29189, '16th Championship League 2c')
//   .then(res => console.log(res))

//dgQueries.getMatchResultFromDg(4309009).then(res => console.log(res))


// TODO: Figure out the correct way to close the connection to the database


//ROUTES

// POST

//add a player to the database
app.post('/players', async (req, res) => {
  try {
    const { user_id, username } = req.body
    const newPlayer = await pool.query(
      `INSERT INTO players (user_id, username)
      VALUES ($1, $2)
      RETURNING *`,
      [user_id, username]
    )
    res.json(newPlayer.rows[0])
  } catch (e) {
    console.error(e.message)
    pool.end()
  }
})

//add a match to the database
app.post('/matches', async (req, res) => {
  try {
    const { match_id, player1, player2, score1, score2, groupname, finished } = req.body
    const newMatch = await pool.query(
      `INSERT INTO matches (match_id, player1, player2, score1, score2, groupname, finished)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (match_id) DO UPDATE
      SET score1 = $4, score2 = $5, finished = $7
      RETURNING *`,
      [match_id, player1, player2, score1, score2, groupname, finished]
    )
    res.json(newMatch.rows[0])
  } catch (e) {
    console.error(e.message)
    pool.end()
  }
})

//login
app.post('/login', async (req, res) => {
  const { login, password } = req.body
  try {
    const loginResponse = await dgLogin.login(login, password)
    console.log(loginResponse)
    res.json(loginResponse)
  } catch (e) {
    console.error(e.message)
  }
})

// GET

//get all groupnames from the database
app.get('/groups/groupnames', async (req, res) => {
  try {
    const groups = await pool.query('SELECT DISTINCT groupname FROM matches')
    res.json(groups.rows.map(x => x.groupname))
  } catch (e) {
    console.error(e.message)
    pool.end()
  }
})

//get matches of a given group from the database
app.get('/groups/matches', async (req, res) => {
  const group = req.query.groupname
  try {
    const matches = await pool.query(
      `SELECT mt.match_id, p1.username AS player1, p2.username AS player2, mt.score1, mt.score2, mt.finished
      FROM matches AS mt
      LEFT JOIN players p1
      ON mt.player1 = p1.user_id
      LEFT JOIN players p2
      ON mt.player2 = p2.user_id
      WHERE mt.groupname = $1`,
      [group]
    )
    res.json(matches.rows)
  } catch (e) {
    console.error(e.message)
    pool.end()
  }
})

//get player ID
app.get('/players/:username', async (req, res) => {
  const { cookie } = req.query
  const header = {
    Cookie: cookie || config.TESTCOOKIE
  }

  // Check if player is in the database
  try {
    const dbRespnse = await pool.query(
      `SELECT user_id FROM players WHERE username = $1`,
      [req.params.username]
    )
    if (dbRespnse.rows.length) {
      //console.log('response sent from the database')
      res.send(dbRespnse.rows[0].user_id.toString())
    }  else {

      //If it is not in the database, check it on dailygammon
      const userId = await dgQueries.getPlayerIdFromDg(req.params.username, header)

      // If found on dailygammon, save it to the database
      if (parseInt(userId)) {
        try {
          const newPlayer = await pool.query(
            `INSERT INTO players (user_id, username)
            VALUES ($1, $2)
            RETURNING *`,
            [userId, req.params.username]
          )
          console.log(`${JSON.stringify(newPlayer.rows[0])} is added to the database`)
        } catch (e) {
          console.error(`${req.params.username} could not be saved to database`)
          console.error(e.message)
          pool.end()
        } finally {
          //console.log('response sent from dailygammon')
          res.send(userId)
        }
      } else {
        res.send(userId)
      }
    }
  } catch (e) {
    console.error('UserId could not be fetched from the database')
    console.error(e.message)
    pool.end()
  }
})

// get match IDs acc. to user id and event name from dailygammon
app.get('/matches', async (req, res) => {
  const { uid, event, cookie } = req.query
  const header = {
    Cookie: cookie || config.TESTCOOKIE
  }

  const matchIds = await dgQueries.getMatchIdsFromDg(uid, event, header)
  if (Array.isArray(matchIds)) {
    res.json({ matchIds })
  } else {
    res.send(matchIds)
  }
})

//get match result acc. to match ID from dailygammon
app.get('/matches/:id', async (req, res) => {
  const { cookie } = req.query
  const header = {
    Cookie: cookie || config.TESTCOOKIE
  }

  const result = await dgQueries.getMatchResultFromDg(req.params.id, header)
  res.json(result)
})

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.listen(config.PORT)
