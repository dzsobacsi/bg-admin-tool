import axios from 'axios'
import encodeUrl from 'encodeurl'

const baseUrl = ['development', 'test'].includes(process.env.NODE_ENV)
  ? 'http://localhost:3000'
  : ''

export const getGroups = async () => {
  try {
    const response = await axios.get(baseUrl + '/groups')
    return response.data
  } catch (e) {
    console.error('getGroups err')
    console.error(e.message)
  }
}

export const getUser = async (username) => {
  const url = encodeUrl(baseUrl + `/players/${username}`)
  try {
    const response = await axios.get(url)
    return response.data
  } catch (e) {
    console.error(`getUser: ${e.message}`)
  }
}

export const getMatchIds = async (uid, event) => {
  let url = encodeUrl(baseUrl + `/matches/matchids?uid=${uid}&event=${event}`)
  try {
    const response = await axios.get(url)
    return response.data
  } catch (e) {
    console.error(`getMatchIds: ${e.message}`)
  }
}

// mid can be either a string or an int
export const getMatchResult = async (mid) => {
  let url = baseUrl + `/matches/${mid}`
  try {
    const response = await axios.get(url)
    return response.data
  } catch (e) {
    console.error(`getMatchResult: ${e.message}`)
  }
}

// get matches of a given group from the database
export const getGroupMatches = async groupname => {
  const url = encodeUrl(baseUrl + `/matches?groupname=${groupname}`)
  try {
    const response = await axios.get(url)
    return response.data
  } catch (e) {
    console.error(`getGroupMatches: ${e.message}`)
  }
}

/*mr is a match result object:
{
  mid
  [playerIds]
  [score]
  finished
  reversed
}*/
export const saveResultToDb = async (mr, groupname) => {
  const url = baseUrl + '/matches'
  const data = {
    match_id: mr.mid,
    player1: mr.playerIds[0],
    player2: mr.playerIds[1],
    score1: mr.score[0],
    score2: mr.score[1],
    groupname,
    finished: mr.finished,
    addedbyuser: parseInt(window.localStorage.getItem('userid')),
    reversed: mr.reversed,
  }
  try {
    const response = await axios.post(url, data)
    return response.data
  } catch (e) {
    console.error(`saveResultToDb: ${e.message}`)
  }
}

// takes a group object with properties: finished, groupname, season, winner
export const saveGroupToDb = async group => {
  const url = baseUrl + '/groups'
  try {
    const response = await axios.post(url, group)
    return response.data
  } catch (e) {
    console.error(`saveGroupToDb: ${e.message}`)
  }
}

export const register = async (user) => {
  // takes a user object { username*, password, email }
  const url = baseUrl + '/players'
  try {
    const response = await axios.post(url, user)
    return response.data
  } catch (e) {
    console.error(`register: ${e.message}`)
  }
}
