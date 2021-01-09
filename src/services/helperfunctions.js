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

// takes a username
// retrurns true if it is an administrator and false otherwise
export const isAdministrator = async username => {
  const user = await dbService.getUser(username)
  return user.data.administrator
}
