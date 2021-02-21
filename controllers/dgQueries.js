const axios = require('axios')
const cheerio = require('cheerio')
const encodeUrl = require('encodeurl')
const config = require('../utils/config')

const baseUrl = 'http://dailygammon.com'
const header = {
  Cookie: config.TESTCOOKIE
}

const getPlayerIdFromDg = async (username) => {
  //Takes a username, returns a user_id
  const url = encodeUrl(baseUrl + `/bg/plist?like=${username}&type=name`)
  try {
    const response = await axios({
      method: 'post',
      url,
      headers: header
    })
    const $ = cheerio.load(response.data)
    const userLinks = $('[href^=\'/bg/user/\']')
    if (userLinks.length !== 1) {
      if (!userLinks.length) {
        return `There is no user: ${username}`
      } else {
        console.warn(
          `There are more than 1 results for ${username} the first one is taken`
        )
      }
    }
    const userLink = userLinks.attr('href')
    const splittedLink = userLink.split('/')
    return splittedLink[splittedLink.length - 1]
  } catch (e) {
    console.error('Could not fetch player ID from dailygammon')
    console.error(e.message)
  }
}

const getMatchIdsFromDg = async (uid, event) => {
  // Takes a user_id and an event name (i.e. group name)
  // returns an array of  match_id-s
  const url = encodeUrl(
    baseUrl + `/bg/user/${uid}?days_to_view=150&active=1&finished=1`
  )
  let matchIds = []
  try {
    const response = await axios({
      method: 'get',
      url,
      headers: header
    })
    const $ = cheerio.load(response.data.toLowerCase())
    $(`tr:contains('${event.toLowerCase()}')`)
      .find('a:contains("review")')
      .each((i, e) => {
        matchIds.push($(e).attr('href'))
      })
    matchIds = matchIds.map(x => x.split('/')[3])
    return matchIds.length
      ? matchIds
      : `Error: No matches for ${uid} and ${event}`
  } catch (e) {
    console.error('Could not fetch match ID from dailygammon')
    console.error(e.message)
  }
}

const getMatchResultFromDg = async (mid) => {
  // Takes a match_id, returns an object like
  // mid: match_id,
  // players: an array of the 2 player names (as their username)
  // finished: boolean - true if the match is finished
  // score: an array of 2 integers as the match score
  const url = baseUrl + `/bg/game/${mid}/0/list`
  try {
    const response = await axios({
      method: 'get',
      url,
      headers: header
    })
    const $ = cheerio.load(response.data)

    const players = $('tr:contains("Game 1")')
      .first()
      .next()
      .children()
      .text()
      .split(' : 0')
      .slice(0, 2)
      .map(s => s.trim())
    //console.log('dgQueries: ', response.status)
    //console.log('dgQueries: ', players)

    const matchEndElement = $('tr:contains("and the match")')
    const finished = !!matchEndElement.length

    let winner = -1
    if (finished) {
      if (matchEndElement.children().length === 4) {
        winner = 1
      }
      else if (matchEndElement.children().first().attr('colspan')) {
        winner = 1
      }
      else {
        winner = 0
      }
    }

    let score = $(`tr:contains("${players[0]}")`)
      .last()
      .text()
    score = [...score.matchAll(/: \d+/g)]
      .map(s => s[0])
      .map(s => s.slice(2))
      .map(x => parseInt(x))
    if (finished) {
      score[winner] = 11
    }

    const result = {
      mid: parseInt(mid),
      finished,
      playerNames: players,
      score
    }

    return result.score.length
      ? result
      : { message: 'Error: Match result could not fetched from DailyGammon - probably due to an invalid match ID.' }

  } catch (e) {
    console.error('Could not fetch match result from dailygammon')
    console.error(e.message)
  }
}

module.exports = { getPlayerIdFromDg, getMatchIdsFromDg, getMatchResultFromDg }
