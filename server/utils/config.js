require('dotenv').config()

const PORT = process.env.PORT
//const DATABASE_URL = process.env.DATABASE_URL
const TESTCOOKIE = process.env.TESTCOOKIE
const JWT_SECRET = process.env.JWT_SECRET
//const LOCAL_DB_PASSWORD = process.env.LOCAL_DB_PASSWORD
const NODE_ENV = process.env.NODE_ENV
const DATASET = NODE_ENV === 'test' ? 'test' : 'backgammon'
const PROJECTID = 'backgammon-db-406515'

module.exports = { PORT, TESTCOOKIE, JWT_SECRET, NODE_ENV, DATASET, PROJECTID }
