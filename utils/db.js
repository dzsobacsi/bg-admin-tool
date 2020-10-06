const Pool = require('pg').Pool
const config = require('./config')

const connection = process.env.NODE_ENV === 'development'
  ? {
    user: 'postgres',
    host: 'localhost',
    database: 'bg_test',
    password: config.LOCAL_DB_PASSWORD,
    port: 5432,
  }
  : {
    connectionString: config.DATABASE_URL,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 3000,
    maxUses: 7500,
    ssl: {
      rejectUnauthorized: false
    }
  }

const pool = new Pool(connection)

module.exports = pool
