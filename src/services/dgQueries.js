const axios = require('axios')
const cheerio = require('cheerio')

const getPlayerIdFromDg = async (username) => {
  const baseUrl = 'http://dailygammon.com'
  const url = baseUrl + `/bg/plist?like=${username}&type=name`
  const headers = {
    Cookie: process.env.TESTCOOKIE
  }
  try {
    const response = await axios({
      method: 'post',
      url,
      headers
    })
    const $ = cheerio.load(response.data)
    const userLink = $("[href^='/bg/user/']").attr('href')
    if (userLink) {
      const splittedLink = userLink.split("/")
      return splittedLink[splittedLink.length - 1]
    } else {
      throw `No user: ${username}`
    }
  } catch (e) {
    console.error(e.message)
  }
}

module.exports = { getPlayerIdFromDg }
