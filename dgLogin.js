//This is not used anywhere.
//It seems that HTML cookies cannot be accessed from JS


const axios = require('axios')
const encodeUrl = require('encodeurl')
//const config = require('./config.js')

const baseUrl = 'http://dailygammon.com'

const login = async (uname, passwd) => {
  const url = encodeUrl(baseUrl + `/bg/login?login=${uname}&password=${passwd}`)
  try {
    const response = await axios.post(url)
    return response
  } catch (e) {
    console.error('Could not log in to dailygammon')
    console.error(e.message)
  }
}

module.exports = { login }
