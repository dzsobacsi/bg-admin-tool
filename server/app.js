const express = require('express')
//const favicon = require('express-favicon')
const path = require('path')
const cors = require('cors')
const morgan = require('morgan')
const config = require('./utils/config')
const playersRouter = require('./controllers/players')
const matchesRouter = require('./controllers/matches')
const groupsRouter = require('./controllers/groups')
const loginRouter = require('./controllers/login')
const dateRouter = require('./controllers/date')

const app = express()
app.use(cors())
app.use(morgan('tiny', { skip: () => config.NODE_ENV === 'test' }))
app.use(express.json())
//app.use(favicon(__dirname + '/../frontend/public/favicon.ico'))
// the __dirname is the current directory from where the script is running
app.use(express.static(path.resolve(__dirname, '../frontend/build')))

app.use('/players', playersRouter)
app.use('/matches', matchesRouter)
app.use('/groups', groupsRouter)
app.use('/login', loginRouter)
app.use('/date', dateRouter)

module.exports = app
