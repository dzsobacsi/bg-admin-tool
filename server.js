const express = require('express')
const favicon = require('express-favicon')
const path = require('path')
const cors = require('cors')
const axios = require('axios')
const cheerio = require('cheerio')
const morgan = require('morgan')
const pool = require('./db')
const config = require('./config')
const app = express()

app.use(cors())
app.use(morgan('tiny'))
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

//get player ID
app.get('/players/:username', async (req, res) => {
  // Check if player is in the database
  try {
    const dbRespnse = await pool.query(
      `SELECT user_id FROM players WHERE username = $1`,
      [req.params.username]
    )
    if (dbRespnse.rows.length) {
      console.log('response sent from the database')
      res.send(dbRespnse.rows[0].user_id.toString())
    }  else {

      //If it is not in the database check it on dailygammon
      const baseUrl = 'http://dailygammon.com'
      const url = baseUrl + `/bg/plist?like=${req.params.username}&type=name`
      const headers = {
        Cookie: process.env.TESTCOOKIE
      }
      try {
        const response = await axios({
          method: 'post',
          url,
          headers
        })
        const $ = cheerio.load(response.data)
        const userLink = $("[href^='/bg/user/']").attr('href')
        if (userLink) {
          const splittedLink = userLink.split("/")
          const userId = splittedLink[splittedLink.length - 1]

          // If found on dailygammon, save it to the database
          try {
            const newPlayer = await pool.query(
              `INSERT INTO players (user_id, username)
              VALUES ($1, $2)
              RETURNING *`,
              [userId, req.params.username]
            )
            console.log(`${JSON.stringify(newPlayer.rows[0])} is added to the database`)
          } catch (e) {
            console.error(e.message)
            pool.end()
          } finally {
            console.log('response sent from dailygammon')
            res.send(userId)
          }
        } else {
          console.log(`no user: ${req.params.username}`)
          res.send(`no user: ${req.params.username}`)
        }
      } catch (e) {
        console.error(e.message);
      }
    }
  } catch (e) {
    console.error(e.message)
    pool.end()
  }
})

// get match IDs acc. to user id and event name
app.get('/matches', async (req, res) => {
  const { uid, event } = req.body
  const baseUrl = 'http://dailygammon.com'
  const url = baseUrl + `/bg/user/${uid}?sort_event=1&active=1&finished=1`
  let matchIds = []
  const headers = {
    Cookie: process.env.TESTCOOKIE
  }
  try {
    const response = await axios({
      method: 'get',
      url,
      headers
    })
    const $ = cheerio.load(response.data)
    $(`tr:contains('${event}')`)
      .find('a:contains("Review")')
      .each((i, e) => {
        matchIds.push($(e).attr('href'))
      })
    matchIds = matchIds.map(x => x.split('/')[3])
    console.log(matchIds)
    res.json({ matchIds })
  } catch (e) {
    console.error(e.message);
  }
})

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.listen(config.PORT)
