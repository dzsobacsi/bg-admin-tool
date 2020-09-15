import axios from 'axios'
import encodeUrl from 'encodeurl'

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
  const url = encodeUrl(baseUrl + `/players/${username}`)
  try {
    const response = await axios.get(url)
    return response.data
  } catch (e) {
    console.error('getPlayerId err')
    console.error(e.message)
  }
}

const getMatchIds = async (uid, event) => {
  const url = encodeUrl(baseUrl + `/matches?uid=${uid}&event=${event}`)
  try {
    const response = await axios.get(url)
    return response.data
  } catch (e) {
    console.error('getMatchIds err')
    console.error(e.message)
  }
}

export default { getGroups, getPlayerId, getMatchIds }
