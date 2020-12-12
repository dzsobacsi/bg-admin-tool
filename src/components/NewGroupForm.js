import React from 'react'
import Button from 'react-bootstrap/Button'
import TextInput from './TextInput'
import dbService from '../services/services'
import { getPlayerIds } from '../services/helperfunctions'

const NewGroupForm = ({
  setFormVisible,
  setMatches,
  groups,
  setGroups,
  setSelectedGroup,
  setLastUpdate,
  setNotifMessage
}) => {
  const createNewGroup = async (e) => {
    e.preventDefault()
    setNotifMessage('Please wait, this will take a little while...')
    const groupName = e.target.gpname.value

    // collect usernames from the form and filter out the ones with zero length
    const inputArray = document.getElementsByName('array')
    const userNames = [...inputArray]
      .map(inp => inp.value)
      .filter(i => i.length)
    console.log(userNames)

    // get all playerIds
    let playerIds = await getPlayerIds(userNames)
    console.log(playerIds)

    // Check if some of the playerIds are undefined
    // and add the missing players to the database
    if (playerIds.includes(undefined)) {
      let missingPlayers = []
      for (let i = 0; i < playerIds.length; i++) {
        if (!playerIds[i]) missingPlayers.push(userNames[i])
      }

      const registerPromises = missingPlayers
        .map(pl => dbService.register({ username: pl }))
      await Promise.all(registerPromises)
      playerIds = await getPlayerIds(userNames)
      console.log(playerIds)
    }

    // Create an object in which usernames the key a payerIds the value
    // Would it bring any benefit to use Map instead of an object?
    let players = {}
    userNames.forEach((un, i) => players[un] = playerIds[i])
    console.log(players)

    //fetch match IDs
    // getMatchIds returns an object like { matchIds: [] }
    const matchIdPromises = playerIds
      .map(pid => dbService.getMatchIds(pid, groupName))
    let matchIds = await Promise.all(matchIdPromises)
    matchIds = matchIds.map(x => x.matchIds).flat() // flat is not supported in IE
    matchIds = [...new Set(matchIds)] // to remove duplicates
    console.log(matchIds)

    //fetch match results
    const matchResultPromises = matchIds
      .map(mid => dbService.getMatchResult(mid))
    let results = await Promise.all(matchResultPromises)
    results = results.filter(
      r => userNames.includes(r.players[0]) && userNames.includes(r.players[1])
    )

    // This block replaces usernames with user IDs
    results = results.map(r => {
      let newRes = { ...r }
      newRes.players = r.players.map(p => players[p])
      return newRes
    })
    console.log(results)

    //check if number of matches is n * (n - 1)
    const expectedNrOfMatches = userNames.length * (userNames.length - 1)
    if (results.length !== expectedNrOfMatches) {
      console.warn('The number of matches does not fit to the number of players')
    }

    //check for duplicates in the player arrays
    let seen = []
    results.forEach((r, i) => {
      if (seen.includes(JSON.stringify(r.players))) {
        console.warn(`The palyers of the match ${JSON.stringify(r)}
also have another match with each other. Their order is replaced`)
        results[i].players.reverse()
        results[i].score.reverse()
        seen.push(JSON.stringify(r.players))
      } else {
        seen.push(JSON.stringify(r.players))
      }
    })

    //save the group and the match results to the database
    if (results.length && window.confirm(
      `${playerIds.length} out of ${userNames.length} users were found.
${results.length} out of ${expectedNrOfMatches} matches were found.
Do you want to save the results to the database?`
    )) {
      // save the new group to the database
      const groupToSave = {
        groupname: groupName,
        season: parseInt(groupName.slice(0, 2)), // This maybe necessary to updated if we use different group names in the future
        date: Math.floor(Date.now() / 1000)
      }
      const addedGroup = await dbService.saveGroupToDb(groupToSave)
      console.log(addedGroup)

      // save the results to the database
      const saveRequestPromises = results
        .map(r => dbService.saveResultToDb(r, groupName))
      const savedMatchResults = await Promise.all(saveRequestPromises)
      console.log(savedMatchResults)
      console.log('Match results are saved to the database')

      const matches = await dbService.getGroupMatches(groupName)
      setMatches(matches)
      setGroups([...groups, addedGroup])
      setSelectedGroup(groupName)
      setFormVisible('')
      setLastUpdate(new Date().toString())
      setNotifMessage(`${results.length} matches were saved to the database`)
    } else if (results.length === 0) {
      setNotifMessage('No matches were found. Enter valid group name and user names.')
    } else {
      setNotifMessage('Operation cancelled')
    }
  }

  const textInputArray = new Array(10).fill()

  return (
    <div className="new-group-form">
      <form onSubmit={createNewGroup}>
        <table>
          <tbody>
            <TextInput label='Group name' name='gpname'/>
            {textInputArray.map((a, i) =>
              <TextInput key={i} label={`Player ${i + 1}`} name='array'/>)}
          </tbody>
        </table><br/>
        <Button variant='outline-success' type="submit">add</Button>&nbsp;
        <Button variant='outline-secondary' onClick={() => setFormVisible('')}>
          cancel
        </Button>
      </form>
    </div>
  )
}

export default NewGroupForm
