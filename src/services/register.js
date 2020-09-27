import axios from 'axios'
import encodeUrl from 'encodeurl'

const baseUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : ''

const register = async (user) => {
  //console.log(user)
  const url = baseUrl + '/users'
  try {
    const response = await axios.post(url, user)
    return response
  } catch (e) {
    console.error(e.message)
  }
}

const getUser = async (username) => {
  const url = encodeUrl(baseUrl + `/users/${username}`)
  try {
    const response = await axios.get(url)
    return response
  } catch (e) {
    console.error(e.message)
  }
}

export default { register, getUser }
