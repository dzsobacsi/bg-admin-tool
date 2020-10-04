require('dotenv').config()

const PORT = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL
const TESTCOOKIE = process.env.TESTCOOKIE
const SECRET = process.env.SECRET
const LOCAL_DB_PASSWORD = process.env.LOCAL_DB_PASSWORD

module.exports = { PORT, DATABASE_URL, TESTCOOKIE, SECRET, LOCAL_DB_PASSWORD }
