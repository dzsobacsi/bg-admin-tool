const supertest = require('supertest')
const app = require('../app')
const pool = require('../utils/db')

const request = supertest(app)

it('fetches a user', async () => {
  await  request
    .get('/players/oldehippy')
    .expect(200)
})

afterAll(async () => {
  await pool.end()
})
