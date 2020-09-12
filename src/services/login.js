import axios from 'axios'

const url = 'http://dailygammon.com/bg/login'
const corsAnywhere = 'https://cors-anywhere.herokuapp.com/'
const headers = {
  //'Origin': 'http://dailygammon.com',
  'X-Requested-With': 'XMLHttpRequest'
}

const login = async (user) => {
  try {
    const response = await axios.post(corsAnywhere+url, user, { headers })
    return response
  } catch (e) {
    console.error(e.message)
  }
}

export default { login }
