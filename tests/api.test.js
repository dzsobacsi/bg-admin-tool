const supertest = require('supertest')
const app = require('../app')
const pool = require('../utils/db')
const initDatabase = require('./initTestDb')

const request = supertest(app)

beforeAll(async () => {
  await initDatabase()
})

// PLAYERS

describe('Players router', () => {
  describe('GET - /players/:username', () => {
    it('fetches a user if a valid username is specified', async () => {
      const res = await  request
        .get('/players/oldehippy')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body).toHaveProperty('user_id', 'username', 'registered', 'administrator')
      expect(res.body.username).toBe('oldehippy')
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
      const res = await request
        .post('/players')
        .send({ username: 'oregammon' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body).toHaveProperty('user_id', 'username', 'passwordhash', 'administrator', 'email', 'registeredwhen')
      expect(res.body.user_id).toBe(16278)
      expect(res.body.username).toBe('oregammon')
      expect(res.body.passwordhash).toBeNull()
      expect(res.body.administrator).toBe(false)
      expect(res.body.email).toBeNull()
      expect(res.body.registeredwhen).not.toBeNull()
    })

    it('adds a new player to the DB if a username, a password and an email address are specified', async () => {
      const res = await request
        .post('/players')
        .send({ username: 'institute', password: '123456', email: 'institute@gmail.com' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body).toHaveProperty('user_id', 'username', 'passwordhash', 'administrator', 'email', 'registeredwhen')
      expect(res.body.user_id).toBe(19228)
      expect(res.body.username).toBe('institute')
      expect(res.body.passwordhash).not.toBeNull()
      expect(res.body.administrator).toBe(false)
      expect(res.body.email).toBe('institute@gmail.com')
      expect(res.body.registeredwhen).not.toBeNull()
    })

    it('updates an existing user if username, password and an email address are specified', async () => {
      const res = await request
        .post('/players')
        .send({ username: 'Uforobban', password: 'abcdefg', email: 'uforobban@gmail.com' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(res.body).toHaveProperty('user_id', 'username', 'passwordhash', 'administrator', 'email', 'registeredwhen')
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
      expect(res.body[0]).toHaveProperty('groupname', 'groupid', 'finished', 'winner', 'season', 'lastupdate')
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ groupname: '17th champ L1' })
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

      expect(res.body).toHaveProperty('groupname', 'groupid', 'finished', 'winner', 'season', 'lastupdate')
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

      expect(res.body).toHaveProperty('groupname', 'groupid', 'finished', 'winner', 'season', 'lastupdate')
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

afterAll(async () => {
  await pool.end()
})
