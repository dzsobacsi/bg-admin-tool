const express = require('express')
const favicon = require('express-favicon')
const path = require('path')
const cors = require('cors')
const pool = require('./db')
const config = require('./config')
const app = express()

app.use(cors())
app.use(express.json())
app.use(favicon(__dirname + '/build/favicon.ico'))
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'build')))

//ROUTES

//add a player
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

//add a match
app.post('/matches', async (req, res) => {
  try {
    const { match_id, player1, player2, score1, score2, groupname, finished } = req.body
    const newMatch = await pool.query(
      `INSERT INTO matches (match_id, player1, player2, score1, score2, groupname, finished)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [match_id, player1, player2, score1, score2, groupname, finished]
    )
    res.json(newMatch.rows[0])
  } catch (e) {
    console.error(e.message)
    pool.end()
  }
})

//get all groups
app.get('/groups', async (req, res) => {
  try {
    const groups = await pool.query('SELECT DISTINCT groupname FROM matches')
    res.json(groups.rows.map(x => x.groupname))
  } catch (e) {
    console.error(e.message)
    pool.end()
  }
})

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.listen(config.PORT)
