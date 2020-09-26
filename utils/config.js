require('dotenv').config()

const PORT = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL
const TESTCOOKIE = process.env.TESTCOOKIE

module.exports = { PORT, DATABASE_URL, TESTCOOKIE }
