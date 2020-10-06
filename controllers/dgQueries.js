const axios = require('axios')
const cheerio = require('cheerio')
const encodeUrl = require('encodeurl')
const config = require('../utils/config')

const baseUrl = 'http://dailygammon.com'
const header = {
  Cookie: config.TESTCOOKIE
}

const getPlayerIdFromDg = async (username) => {
  //console.log('getPlayerIdFromDg:', username, header)
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
  //console.log('getMatchIdsFromDg:', uid, event, header)
  const url = encodeUrl(
    baseUrl + `/bg/user/${uid}?sort_event=1&active=1&finished=1`
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
    if (matchIds.length) {
      return matchIds
    } else {
      return `No matches for ${uid} and ${event}`
    }
  } catch (e) {
    console.error('Could not fetch match ID from dailygammon')
    console.error(e.message)
  }
}

const getMatchResultFromDg = async (mid) => {
  //console.log('getMatchIdsFromDg:', mid, header)
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

    return {
      mid: parseInt(mid),
      players,
      finished,
      score
    }

  } catch (e) {
    console.error('Could not fetch match result from dailygammon')
    console.error(e.message)
  }
}

module.exports = { getPlayerIdFromDg, getMatchIdsFromDg, getMatchResultFromDg }
