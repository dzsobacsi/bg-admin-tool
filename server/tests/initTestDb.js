const client = require('../utils/gbq')

const initDatabase = async () => {
  const options = {
    query:
      `DELETE FROM test.matches WHERE true;
      DELETE FROM test.groups WHERE true;
      DELETE FROM test.players WHERE true;
      INSERT INTO test.players (user_id, username, administrator) VALUES (1070, 'oldehippy', true);
      INSERT INTO test.players (user_id, username, administrator) VALUES (33328, 'Uforobban', false);
      INSERT INTO test.players (user_id, username, administrator) VALUES (32684, 'PiT', false);
      INSERT INTO test.groups (groupname, groupid, finished, season) VALUES ('17th champ L1', '1', false, 17);
      INSERT INTO test.groups (groupname, groupid, finished, season) VALUES ('17th champ L2', '2', false, 17);
      INSERT INTO test.matches (match_id, player1, player2, score1, score2, finished, groupid, reversed) VALUES (1, 1070, 33328, 7, 8, false, '1', false);
      INSERT INTO test.matches (match_id, player1, player2, score1, score2, finished, groupid, reversed) VALUES (2, 32684, 33328, 11, 8, true, '1', false);
      INSERT INTO test.matches (match_id, player1, player2, score1, score2, finished, groupid, reversed) VALUES (3, 1070, 32684, 7, 11, true, '1', false);`
  }
  const [job] = await client.createQueryJob(options)
  const [rows] = await job.getQueryResults()
  rows.forEach(row => {
    console.log(row);
  })
  console.log('\n****************************\nTest database is initialized\n****************************\n')
}

module.exports = initDatabase
