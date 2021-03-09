const supertest = require('supertest')
const app = require('../app')
const nock = require('nock')
const pool = require('../utils/db')
const initDatabase = require('./initTestDb')
const fs = require('fs')
const path = require('path')

const request = supertest(app)

beforeAll(async () => {
  await initDatabase()
})

afterAll(async () => {
  await initDatabase()
  await pool.end()
})

// PLAYERS

describe('Players router', () => {
  describe('GET - /players/:username', () => {
    it('fetches a user from the DB if a valid username is specified', async () => {
      const res = await  request
        .get('/players/oldehippy')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body).toEqual(expect.objectContaining({
        user_id: 1070,
        username: 'oldehippy',
        administrator: true
      }))
    })

    it('returns 404 and a message if the user does not exists in the DB', async () => {
      const res = await request
        .get('/players/nonexistinguser')
        .expect(404)
        .expect('Content-Type', /application\/json/)

      expect(res.body.message).toBe(
        'Error: There is no user nonexistinguser in the database'
      )
    })
  })

  describe('POST - /players', () => {
    it('adds a new player to the DB if only the username is specified', async () => {
      const mockedResponse = fs.readFileSync(path.resolve(__dirname, './mockedResults/DGuserlist-oregammon.html'))
      nock('http://dailygammon.com')
        .post('/bg/plist?like=oregammon&type=name')
        .reply(200, mockedResponse)

      const res = await request
        .post('/players')
        .send({ username: 'oregammon' })
        .expect(200) // As create and update are handled with the same query, 200 is returned from both if the operation is successful
        .expect('Content-Type', /application\/json/)

      expect(res.body.user_id).toBe(16278)
      expect(res.body.username).toBe('oregammon')
      expect(res.body.passwordhash).toBeNull()
      expect(res.body.administrator).toBe(false)
      expect(res.body.email).toBeNull()
      expect(res.body.registeredwhen).not.toBeNull()
    })

    it('adds a new player to the DB if a username, a password and an email address are specified', async () => {
      const mockedResponse = fs.readFileSync(path.resolve(__dirname, './mockedResults/DGuserlist-institute.html'))
      nock('http://dailygammon.com')
        .post('/bg/plist?like=institute&type=name')
        .reply(200, mockedResponse)

      const res = await request
        .post('/players')
        .send({ username: 'institute', password: '123456', email: 'institute@gmail.com' })
        .expect(200) // As create and update are handled with the same query, 200 is returned from both if the operation is successful
        .expect('Content-Type', /application\/json/)

      expect(res.body.user_id).toBe(19228)
      expect(res.body.username).toBe('institute')
      expect(res.body.passwordhash).not.toBeNull()
      expect(res.body.administrator).toBe(false)
      expect(res.body.email).toBe('institute@gmail.com')
      expect(res.body.registeredwhen).not.toBeNull()
    })

    it('updates an existing user if username, password and an email address are specified', async () => {
      const mockedResponse = fs.readFileSync(path.resolve(__dirname, './mockedResults/DGuserlist-Uforobban.html'))
      nock('http://dailygammon.com')
        .post('/bg/plist?like=Uforobban&type=name')
        .reply(200, mockedResponse)

      const res = await request
        .post('/players')
        .send({ username: 'Uforobban', password: 'abcdefg', email: 'uforobban@gmail.com' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body.user_id).toBe(33328)
      expect(res.body.username).toBe('Uforobban')
      expect(res.body.passwordhash).not.toBeNull()
      expect(res.body.administrator).toBe(false)
      expect(res.body.email).toBe('uforobban@gmail.com')
      expect(res.body.registeredwhen).not.toBeNull()
    })

    it('returns 400 and a message if the username is not specified', async () => {
      const res = await request
        .post('/players')
        .send({ password: '123456', email: 'badrequest@gmail.com' })
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(res.body.message).toBe('Error: Cannot add a new player. Username is missing.')
    })

    it('returns 400 and a message if the username does not exists in DailyGammon', async () => {
      const mockedResponse = fs.readFileSync(path.resolve(__dirname, './mockedResults/DGuserlist-nonexistinguser.html'))
      nock('http://dailygammon.com')
        .post('/bg/plist?like=nonexistinguser&type=name')
        .reply(200, mockedResponse)

      const res = await request
        .post('/players')
        .send({ username: 'nonexistinguser' })
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(res.body.message).toBe('Error: No user nonexistinguser exists in DailyGammon.')
    })
  })
})

// GROUPS

describe('Groups router', () => {
  describe('GET - /groups', () => {
    it('fetches all groups from the DB', async () => {
      const res = await request
        .get('/groups')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body).toHaveLength(2)
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            groupname: '17th champ L1',
            finished: false,
            season: 17,
            winner: null
          })
        ])
      )
    })
  })

  describe('POST - /groups', () => {
    it('adds a new group to the DB if the groupname and the season are specified', async () => {
      const res = await request
        .post('/groups')
        .send({ groupname: '17th champ L3', season: 17 })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body.groupname).toBe('17th champ L3')
      expect(res.body.groupid).not.toBeNull()
      expect(res.body.finished).toBe(false)
      expect(res.body.winner).toBeNull()
      expect(res.body.season).toBe(17)
      expect(res.body.lastupdate).not.toBeNull()
    })

    it('updates an existing group if groupname, winner and season are specified', async () => {
      const res = await request
        .post('/groups')
        .send({ groupname: '17th champ L1', winner: 'oldehippy', season: 17 })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body.groupname).toBe('17th champ L1')
      expect(res.body.groupid).toBe(1)
      expect(res.body.finished).toBe(true)
      expect(res.body.winner).toBe(1070) //notice the difference
      expect(res.body.season).toBe(17)
      expect(res.body.lastupdate).not.toBeNull()
    })

    it('returns 400 and a message if groupname is not specified', async () => {
      const res = await request
        .post('/groups')
        .send({ season: 17 })
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(res.body.message).toBe('Error: Cannot add a group. Groupname or season is missing')
    })

    it('returns 400 and a message if season is not specified', async () => {
      const res = await request
        .post('/groups')
        .send({ groupname: '17th champ L4' })
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(res.body.message).toBe('Error: Cannot add a group. Groupname or season is missing')
    })

    it('returns 400 and a message if winner is not a valid username', async () => {
      const res = await request
        .post('/groups')
        .send({ groupname: '17th champ L2', winner: 'nonexistinguser', season: 17 })
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(res.body.message).toBe('Error: Cannot update the group with the given winner. nonexistinguser does not exist in the database.')
    })
  })
})

// MATCHES

describe('Matches router', () => {
  describe('GET - /matches/:id', () => {
    it('fetches match result from DailyGammon', async () => {
      const mockedResponse = fs.readFileSync(path.resolve(__dirname, './mockedResults/DGmatch-4338029.html'))
      nock('http://dailygammon.com')
        .get('/bg/game/4338029/0/list')
        .reply(200, mockedResponse)

      await request
        .get('/matches/4338029')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect({
          mid: 4338029,
          finished: true,
          playerNames: ['dzsobacsi', 'JHD'],
          score: [11, 6]
        })
    })

    it('returns 404 and an error message in case of invalid match ID', async () => {
      const mockedResponse = fs.readFileSync(path.resolve(__dirname, './mockedResults/DGmatch-9999999.html'))
      nock('http://dailygammon.com')
        .get('/bg/game/9999999/0/list')
        .reply(200, mockedResponse)

      await request
        .get('/matches/9999999')
        .expect(404)
        .expect('Content-Type', /application\/json/)
        .expect({
          message: 'Error: Match result could not fetched from DailyGammon - probably due to an invalid match ID.'
        })
    })
  })

  describe('GET - /matches/matchids?uid=<user_id>&event=<group_name>', () => {
    const mockedResponse = fs.readFileSync(path.resolve(__dirname, './mockedResults/DGusermatches-31952.html'))

    it('fetches all match IDs from DailyGammon corresponding to a given user and a given event', async () => {
      nock('http://dailygammon.com')
        .get('/bg/user/31952?days_to_view=150&active=1&finished=1')
        .reply(200, mockedResponse)

      const res = await request
        .get('/matches/matchids?uid=31952&event=17th%20championship%20League%201a')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body.matchIds).toHaveLength(19)
      expect(res.body.matchIds.map(x => parseInt(x)))
        .toEqual(expect.not.arrayContaining([NaN]))
    })

    it('returns 404 and an error message in case of wrong parameters', async () => {
      nock('http://dailygammon.com')
        .get('/bg/user/31952?days_to_view=150&active=1&finished=1')
        .reply(200, mockedResponse)

      await request
        .get('/matches/matchids?uid=31952&event=nonexistingevent')
        .expect(404)
        .expect('Content-Type', /application\/json/)
        .expect({
          message: 'Error: No matches for 31952 and nonexistingevent'
        })
    })
  })

  describe('GET - /matches?groupname=<group_name>', () => {
    it('fetches all matches of a given group from the database', async () => {
      const res = await request
        .get('/matches?groupname=17th%20champ%20L1')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body).toHaveLength(3)
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            match_id: 1,
            player1: 'oldehippy',
            player2: 'Uforobban',
            score1: 7,
            score2: 8,
            finished: false,
            reversed: false
          })
        ])
      )
    })

    it('returns 404 and an error message if the given group name does not exist', async () => {
      const res = await request
        .get('/matches?groupname=nonexistinggroup')
        .expect(404)
        .expect('Content-Type', /application\/json/)

      expect(res.body.message).toBe('Error: There are no matches in the database in group nonexistinggroup')
    })
  })

  describe('POST - /matches', () => {
    it('adds a match to the database if all parameters are well specified', async () => {
      const res = await request
        .post('/matches')
        .send({
          match_id: 4,
          player1: 33328,
          player2: 1070,
          score1: 11,
          score2: 10,
          groupname: '17th champ L1',
          finished: true,
          addedbyuser: 1070,
          reversed: false
        })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body).toMatchObject({
        match_id: 4,
        player1: 33328,
        player2: 1070,
        score1: 11,
        score2: 10,
        groupid: 1,
        finished: true,
        addedbyuser: 1070,
      })
    })

    it('adds a match to the database even if some of the scores are zero', async () => {
      const res = await request
        .post('/matches')
        .send({
          match_id: 5,
          player1: 32684,
          player2: 1070,
          score1: 0,
          score2: 0,
          groupname: '17th champ L1',
          finished: false,
          addedbyuser: 1070,
          reversed: false
        })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body).toMatchObject({
        match_id: 5,
        player1: 32684,
        player2: 1070,
        score1: 0,
        score2: 0,
        groupid: 1,
        finished: false,
        addedbyuser: 1070,
      })
    })

    it('returns 400 and a message if match_id is not specified', async () => {
      await request
        .post('/matches')
        .send({
          player1: 33328,
          player2: 1070,
          score1: 11,
          score2: 10,
          groupname: '17th champ L1',
          finished: true,
          addedbyuser: 1070,
          reversed: false
        })
        .expect(400)
        .expect('Content-Type', /application\/json/)
        .expect({
          message: 'Error: Could not save the match to the database. Some of the required paramaters are missing'
        })
    })

    it('returns 400 and a message if finished is not specified', async () => {
      await request
        .post('/matches')
        .send({
          match_id: 4,
          player1: 33328,
          player2: 1070,
          score1: 11,
          score2: 10,
          groupname: '17th champ L1',
          addedbyuser: 1070,
          reversed: false
        })
        .expect(400)
        .expect('Content-Type', /application\/json/)
        .expect({
          message: 'Error: Could not save the match to the database. Some of the required paramaters are missing'
        })
    })
  })
})

// LOGIN

describe('Login router', () => {
  describe('POST - /login', () => {
    beforeAll(async () => {
      const mockedResponse = fs.readFileSync(path.resolve(__dirname, './mockedResults/DGuserlist-asdasd.html'))
      nock('http://dailygammon.com')
        .post('/bg/plist?like=asdasd&type=name')
        .reply(200, mockedResponse)

      await request
        .post('/players')
        .send({ username: 'asdasd', password: '12345678', email: 'asdasd@gmail.com' })
    })

    it('is possible to log in if correct username and password are specified', async () => {
      const res = await request
        .post('/login')
        .send({ username: 'asdasd', password: '12345678' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body).toMatchObject({
        username: 'asdasd',
        userid: 24172
      })
    })

    it('returns 401 and a message if wrong password is specified', async () => {
      const res = await request
        .post('/login')
        .send({ username: 'asdasd', password: '123456' })
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(res.body.message).toBe('Error: Invalid username or password')
    })

    it('returns 401 and a message if wrong username is specified', async () => {
      const res = await request
        .post('/login')
        .send({ username: 'asd', password: '12345678' })
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(res.body.message).toBe('Error: Invalid username or password')
    })
  })
})
