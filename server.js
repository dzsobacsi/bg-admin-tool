const express = require('express')
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

app.listen(
  config.PORT,
  () => console.log(`Server started at port ${config.PORT}`)
)
