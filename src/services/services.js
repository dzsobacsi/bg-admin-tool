import axios from 'axios'
import encodeUrl from 'encodeurl'

const baseUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : ''

const getGroups = async () => {
  try {
    const response = await axios.get(baseUrl + '/groups/groupnames')
    return response.data
  } catch (e) {
    console.error('getGroups err')
    console.error(e.message)
  }
}

const getUser = async (username) => {
  const url = encodeUrl(baseUrl + `/players/${username}`)
  try {
    const response = await axios.get(url)
    return response
  } catch (e) {
    console.error(e.message)
  }
}

const getMatchIds = async (uid, event) => {
  let url = encodeUrl(baseUrl + `/matches/matchid?uid=${uid}&event=${event}`)
  try {
    const response = await axios.get(url)
    return response.data
  } catch (e) {
    console.error('getMatchIds err')
    console.error(e.message)
  }
}

const getMatchResult = async (mid) => {
  let url = baseUrl + `/matches/${mid}`
  try {
    const response = await axios.get(url)
    return response.data
  } catch (e) {
    console.error('getMatchResult err')
    console.error(e.message)
  }
}

const getGroupMatches = async groupname => {
  const url = encodeUrl(baseUrl + `/groups/matches?groupname=${groupname}`)
  try {
    const response = await axios.get(url)
    return response.data
  } catch (e) {
    console.error('getGroupMatches err')
    console.error(e.message)
  }
}

const saveResultToDb = async (mr, groupname) => {
  const url = baseUrl + '/matches'
  const data = {
    match_id: mr.mid,
    player1: mr.players[0],
    player2: mr.players[1],
    score1: mr.score[0],
    score2: mr.score[1],
    groupname,
    finished: mr.finished,
    addedwhen: Math.floor(Date.now() / 1000),
    addedbyuser: parseInt(window.localStorage.getItem('userid'))
  }
  try {
    const response = await axios.post(url, data)
    return response.data
  } catch (e) {
    console.error('saveResultToDb err')
    console.error(e.message)
  }
}

const saveGroupToDb = async group => {
  const url = baseUrl + '/groups'
  try {
    const response = await axios.post(url, group)
    return response.data
  } catch (e) {
    console.error('saveNewGroupToDb err')
    console.error(e.message)
  }
}

const register = async (user) => {
  // takes a user object { username*, password, email }
  const url = baseUrl + '/players'
  try {
    const response = await axios.post(url, user)
    return response
  } catch (e) {
    console.error(e.message)
  }
}

export default {
  getGroups,
  getUser,
  getMatchIds,
  getMatchResult,
  saveResultToDb,
  getGroupMatches,
  saveGroupToDb,
  register,
}
