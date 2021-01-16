import dbService from './services'

export const sortGroups = (a, b) =>
  b.season - a.season || a.groupname.localeCompare(b.groupname)

// takes an array of userNames
// returns an array of userIds from the database
export const getPlayerIds = async userNames => {
  const playerIdPromises = userNames.map(uname => dbService.getUser(uname))
  const players = await Promise.all(playerIdPromises)
  return players.map(p => p.data.user_id)
}

// takes an array of userNames
// return an array of userNames which are not available in the DB
export const missingPlayersFrom = async playerNames => {
  const playerIds = await getPlayerIds(playerNames)
  return playerNames.filter((pn, i) => !playerIds[i])
}

// takes a username
// retrurns true if it is an administrator and false otherwise
export const isAdministrator = async username => {
  const user = await dbService.getUser(username)
  return user.data.administrator
}

// takes a list of matchIDs
// returns a list of match results from DG
export const getMatchResultsFromDg = async matchIds => {
  const matchResultPromises = matchIds
    .map(mid => dbService.getMatchResult(mid))
  return await Promise.all(matchResultPromises)
}

// takes a list of result objects from DG
// returns a list of objects with 2 added properties
// - reversed: false
// - userIds: [] (list of 2 userIds)
// this way the object becomes ready to be saved to the DB
export const processResultObjects = async results => {
  const playersSet = new Set()
  results.forEach(m => {
    playersSet.add(m.playerNames[0])
    playersSet.add(m.playerNames[1])
  })
  const userNames = [...playersSet]
  if (userNames.some(un => typeof un === 'undefined')) {
    console.error('The fetched results contain undefined usernames')
    return false
  }

  const playerIds = await getPlayerIds(userNames)
  const players = {}
  userNames.forEach((un, i) => players[un] = playerIds[i])
  return results.map(r => ({
    ...r,
    playerIds: r.playerNames.map(p => players[p]),
    reversed: false,
  }))
}

// takes a processed match result object
// returns the same object with reversed playerNames, playerIds and score
export const swapResult = result => {
  const newRes = { ...result }
  newRes.playerNames.reverse()
  newRes.playerIds.reverse()
  newRes.score.reverse()
  newRes.reversed = true
  return newRes
}

// takes an array of processed results
// checks for duplicates and swaps them
// returns the same array with no duplicates
export const handleDuplicates = results => {
  const seen = []
  results.forEach((r, i) => {
    if (seen.includes(JSON.stringify(r.playerIds))) {
      console.warn(`The palyers of the match ${JSON.stringify(r)}
also have another match with each other. Their order is replaced`)
      results[i].playerNames.reverse()
      results[i].playerIds.reverse()
      results[i].score.reverse()
      results[i].reversed = true
    } else {
      seen.push(JSON.stringify(r.playerIds))
    }
  })
  return results
}

// takes an array of playerIds and a group name
// returns an array of matchIds
// returns all matchIds of all users having matches with the given groupname
// used only by NewGroupForm
export const getMatchIds = async (playerIds, groupName) => {
  const matchIdPromises = playerIds
    .map(pid => dbService.getMatchIds(pid, groupName))
  let matchIds = await Promise.all(matchIdPromises) // the result here is a 2D array
  matchIds = matchIds.map(x => x.matchIds).flat() // flat is not supported in IE
  matchIds = [...new Set(matchIds)] // to remove duplicates
  return matchIds
}

// takes an array of usernames
// saves them to the DB, and returns the server response
export const registerPlayers = async playerNames => {
  const registerPromises = playerNames
    .map(pl => dbService.register({ username: pl }))
  return await Promise.all(registerPromises)
}

// takes an array of processed results and a group name
// saves them to the DB and returns the server response
export const saveMatchesToDb = async (results, groupName) => {
  const saveRequestPromises = results
    .map(r => dbService.saveResultToDb(r, groupName))
  return await Promise.all(saveRequestPromises)
}

// takes a groupname
// returns a season number in Int if the begining of the gpname is a number
// returns null otherwise
export const seasonFromGroupName = gpname => {
  const season = parseInt(gpname.substring(0,2))
  return season ? season : null
}
