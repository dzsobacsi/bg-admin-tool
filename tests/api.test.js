const supertest = require('supertest')
const app = require('../app')
const pool = require('../utils/db')
const initDatabase = require('./initTestDb')

const request = supertest(app)

beforeAll(async () => {
  await initDatabase()
})

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

    it('adds a new player to the DB if a username, a password and an email address is specified', async () => {
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

afterAll(async () => {
  await pool.end()
})
