const Pool = require('pg').Pool
const config = require('./config')

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 3000,
  maxUses: 7500,
  ssl: {
    rejectUnauthorized: false
  }
})

module.exports = pool
