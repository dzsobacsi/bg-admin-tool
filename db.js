const Pool = require('pg').Pool
const config = require('./config')

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

module.exports = pool
