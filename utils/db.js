const config = require('./config')

const poolConfig = {
  connectionString: config.DATABASE_URL,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 3000,
  maxUses: 7500,
  ssl: {
    rejectUnauthorized: false
  }
}

module.exports = poolConfig
