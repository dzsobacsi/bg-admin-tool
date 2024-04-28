const pool = require('../utils/db')

const initDatabase = async () => {
  const client = await pool.connect()
  await client.query(`
    DELETE FROM matches;
    DELETE FROM groups;
    DELETE FROM players;
    INSERT INTO players (user_id, username, administrator) VALUES (1070, 'oldehippy', true);
    INSERT INTO players (user_id, username, administrator) VALUES (33328, 'Uforobban', false);
    INSERT INTO players (user_id, username, administrator) VALUES (32684, 'PiT', false);
    INSERT INTO groups (groupname, groupid, finished, season) VALUES ('17th champ L1', 1, false, 17);
    INSERT INTO groups (groupname, groupid, finished, season) VALUES ('17th champ L2', 2, false, 17);
    INSERT INTO matches (match_id, player1, player2, score1, score2, finished, groupid, reversed) VALUES (1, 1070, 33328, 7, 8, false, 1, false);
    INSERT INTO matches (match_id, player1, player2, score1, score2, finished, groupid, reversed) VALUES (2, 32684, 33328, 11, 8, true, 1, false);
    INSERT INTO matches (match_id, player1, player2, score1, score2, finished, groupid, reversed) VALUES (3, 1070, 32684, 7, 11, true, 1, false);
    INSERT INTO matches (match_id, player1, player2, score1, score2, finished, groupid, reversed) VALUES (4, 1070, 33328, 7, 8, false, 2, false);
    INSERT INTO matches (match_id, player1, player2, score1, score2, finished, groupid, reversed) VALUES (5, 32684, 33328, 11, 8, true, 2, false);
    INSERT INTO matches (match_id, player1, player2, score1, score2, finished, groupid, reversed) VALUES (6, 1070, 32684, 7, 11, true, 2, false);
  `)
  client.release()
}

module.exports = initDatabase
