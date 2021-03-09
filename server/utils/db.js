const Pool = require('pg').Pool
const config = require('./config')

let connection
if (config.NODE_ENV === 'development') {
  connection = {
    user: 'postgres',
    host: 'localhost',
    database: 'bg_development',
    password: config.LOCAL_DB_PASSWORD,
    port: 5432,
  }
} else if (config.NODE_ENV === 'test') {
  connection = {
    user: 'postgres',
    host: 'localhost',
    database: 'bg_test',
    password: config.LOCAL_DB_PASSWORD,
    port: 5432,
  }
} else {
  connection = {
    connectionString: config.DATABASE_URL,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 3000,
    maxUses: 7500,
    ssl: {
      rejectUnauthorized: false
    }
  }
}

const pool = new Pool(connection)

module.exports = pool
