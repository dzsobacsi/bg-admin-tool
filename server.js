const express = require('express')
const favicon = require('express-favicon')
const path = require('path')
const cors = require('cors')
const morgan = require('morgan')
const config = require('./utils/config')
const playersRouter = require('./controllers/players')
const matchesRouter = require('./controllers/matches')
const groupsRouter = require('./controllers/groups')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const app = express()

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())
app.use(favicon(__dirname + '/build/favicon.ico'))
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'build')))

app.use('/players', playersRouter)
app.use('/matches', matchesRouter)
app.use('/groups', groupsRouter)
app.use('/users', usersRouter)
app.use('/login', loginRouter)

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.listen(config.PORT)
