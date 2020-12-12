import dbService from '../services/services'

export const sortGroups = (a, b) =>
  b.season - a.season || a.groupname.localeCompare(b.groupname)

// takes an array of userNames
// returns an array of userIds
export const getPlayerIds = async userNames => {
  const playerIdPromises = userNames.map(uname => dbService.getUser(uname))
  const players = await Promise.all(playerIdPromises)
  return players.map(p => p.data.user_id)
}
