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

const getPlayerId = async (username, cookie) => {
  let url = encodeUrl(baseUrl + `/players/${username}`)
  if (cookie) {
    url += `?cookie=${cookie}`
  }
  try {
    const response = await axios.get(url)
    return response.data
  } catch (e) {
    console.error('getPlayerId err')
    console.error(e.message)
  }
}

const getMatchIds = async (uid, event, cookie) => {
  let url = encodeUrl(baseUrl + `/matches?uid=${uid}&event=${event}`)
  if (cookie) {
    url += `&cookie=${cookie}`
  }
  try {
    const response = await axios.get(url)
    return response.data
  } catch (e) {
    console.error('getMatchIds err')
    console.error(e.message)
  }
}

const getMatchResult = async (mid, cookie) => {
  let url = baseUrl + `/matches/${mid}`
  if (cookie) {
    url += `?cookie=${cookie}`
  }
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
    finished: mr.finished
  }
  try {
    const response = await axios.post(url, data)
    return response.data
  } catch (e) {
    console.error('saveResultToDb err')
    console.error(e.message)
  }
}

export default {
  getGroups,
  getPlayerId,
  getMatchIds,
  getMatchResult,
  saveResultToDb,
  getGroupMatches
}
