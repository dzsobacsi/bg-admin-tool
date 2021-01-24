const pool = require('../utils/db')

const initDatabase = async () => {
  const client = await pool.connect()
  await client.query(`
    DELETE FROM matches;
    DELETE FROM groups;
    DELETE FROM players;
    INSERT INTO players (user_id, username, administrator) VALUES (1070, 'oldehippy', false);
    INSERT INTO players (user_id, username, administrator) VALUES (33328, 'Uforobban', false);
    INSERT INTO players (user_id, username, administrator) VALUES (32684, 'PiT', false);
  `)
  await client.release()
}

module.exports = initDatabase
