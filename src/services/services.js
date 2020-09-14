import axios from 'axios'

const baseUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : ''

const getGroups = async () => {
  try {
    const response = await axios.get(baseUrl + '/groups')
    return response.data
  } catch (e) {
    console.error('getGroups err')
    console.error(e.message)
  }
}

const getPlayerId = async (username) => {
  try {
    const response = await axios.get(baseUrl + `/players/${username}`)
    return response.data
  } catch (e) {
    console.error('getGroups err')
    console.error(e.message)
  }
}

export default { getGroups, getPlayerId }
