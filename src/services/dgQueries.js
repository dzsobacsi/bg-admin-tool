const axios = require('axios')
const cheerio = require('cheerio')
const encodeUrl = require('encodeurl')
const config = require('../../config.js')

const baseUrl = 'http://dailygammon.com'

const getPlayerIdFromDg = async (username) => {
  const url = encodeUrl(baseUrl + `/bg/plist?like=${username}&type=name`)
  const headers = {
    Cookie: config.TESTCOOKIE
  }
  try {
    const response = await axios({
      method: 'post',
      url,
      headers
    })
    const $ = cheerio.load(response.data)
    const userLinks = $("[href^='/bg/user/']")
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
    const splittedLink = userLink.split("/")
    return splittedLink[splittedLink.length - 1]
  } catch (e) {
    console.error('Could not fetch html from dailygammon')
    console.error(e.message)
  }
}

const getMatchIdsFromDg = async (uid, event) => {
  const url = encodeUrl(
    baseUrl + `/bg/user/${uid}?sort_event=1&active=1&finished=1`
  )
    const headers = {
    Cookie: config.TESTCOOKIE
  }
  let matchIds = []
  try {
    const response = await axios({
      method: 'get',
      url,
      headers
    })
    const $ = cheerio.load(response.data)
    $(`tr:contains('${event}')`)
      .find('a:contains("Review")')
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
    console.error(e.message);
  }
}

module.exports = { getPlayerIdFromDg, getMatchIdsFromDg }
