import React from 'react'
import TextInput from './TextInput'
import dbService from '../services/services'

const NewGroupForm = ({ setFormVisible, setMatches, groups, setGroups }) => {
  const createNewGroup = async (e) => {
    e.preventDefault()
    const groupName = e.target.gpname.value

    //fetch player IDs
    const inputArray = document.getElementsByName('array')
    const userNames = [...inputArray]
      .map(inp => inp.value)
      .filter(i => i.length)
    console.log(userNames)

    const playerIdPromises = userNames
      .map(uname => dbService.getPlayerId(uname))
    const playerIds = await Promise.all(playerIdPromises)
    console.log(playerIds)

    let players = {}
    userNames.forEach((un, i) => players[un] = playerIds[i])
    console.log(players)

    //fetch match IDs
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
      let newRes = {...r}
      newRes.players = r.players.map(p => players[p])
      return newRes
    })
    console.log(results)

    //check if number of matches is n * (n - 1)
    if (results.length !== userNames.length * (userNames.length - 1)) {
      console.warn(`The number of matches does not fit to the number of players
Some matches are possilby not started yet`)
    }

    //check for duplicates in the player arrays
    let seen = []
    results.forEach((r, i) => {
      if (seen.includes(JSON.stringify(r.players))) {
        console.warn(`The palyers of the match ${JSON.stringify(r)}
also have another match with each other. Their order is replaced`)
        results[i].players.reverse()
        seen.push(JSON.stringify(r.players))
      } else {
        seen.push(JSON.stringify(r.players))
      }
    })

    //save match results to the database
    if (window.confirm('Do you want to save the results to the database?')) {
      const saveRequestPromises = results
        .map(r => dbService.saveResultToDb(r, groupName))
      const savedMatchResults = await Promise.all(saveRequestPromises)
      console.log(savedMatchResults)
      console.log('Match results are saved to the database')
      setMatches(savedMatchResults)
      setGroups([...groups, groupName])
      setFormVisible('')
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
        <button type="submit">add</button>&nbsp;
        <button onClick={() => setFormVisible('')}>cancel</button>
      </form>
    </div>
  )
}

export default NewGroupForm
