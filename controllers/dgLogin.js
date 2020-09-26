const axios = require('axios')
const encodeUrl = require('encodeurl')

const transfer = axios.create({
  withCredentials: true,
  baseURL: 'http://dailygammon.com'
})

const login = async (uname, passwd) => {
  const url = encodeUrl(`/bg/login?login=${uname}&password=${passwd}`)
  try {
    let response = await transfer.post(url)
    return response.headers['set-cookie']
      .map(s => s.split(';')[0])
      .map(s => s + ';')
      .join(' ')
  } catch (e) {
    console.error('Could not log in to dailygammon')
    console.error(e.message)
  }
}

module.exports = { login }
