import React from 'react'
import dbService from '../services/services'

const NewGroupForm = ({ toggleFormVisible }) => {
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
    if (results.length !== userNames.length * (userNames.length - 1)) {
      console.warn('The number of matches does not fit to the number of players')
      console.warn('Some matches are possilby not started yet')
    }

    //save match results to the database
    const saveRequestPromises = results
      .map(r => dbService.saveResultToDb(r, groupName))
    const savedMatchResults = await Promise.all(saveRequestPromises)
    console.log(savedMatchResults)
    console.log('Match results are saved to the database')

    // TODO:
    // - Do some checks before saving to the db
    // - Ask for confirmation before save
    // - Load results to app sate
    // - Show results in a table on the right
    // - Close the form
  }

  return (
    <div className="NewGroupForm">
      <form onSubmit={createNewGroup}>
        Group name: <input type="text" name="gpname"/><br/>
        Player 1:   <input type="text" name="array"/><br/>
        Player 2:   <input type="text" name="array"/><br/>
        Player 3:   <input type="text" name="array"/><br/>
        Player 4:   <input type="text" name="array"/><br/>
        Player 5:   <input type="text" name="array"/><br/>
        Player 6:   <input type="text" name="array"/><br/>
        Player 7:   <input type="text" name="array"/><br/>
        Player 8:   <input type="text" name="array"/><br/>
        Player 9:   <input type="text" name="array"/><br/>
        Player 10:  <input type="text" name="array"/><br/>
        <button type="submit">add</button>
        <button onClick={toggleFormVisible}>cancel</button>
      </form>
    </div>
  )
}

export default NewGroupForm
