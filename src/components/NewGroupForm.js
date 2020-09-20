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
    <div className="new-group-form">
      <form onSubmit={createNewGroup}>
        <table>
          <tbody>
            <tr><td>Group name: </td><td><input type="text" name="gpname"/></td></tr>
            <tr><td>Player 1:   </td><td><input type="text" name="array"/></td></tr>
            <tr><td>Player 2:   </td><td><input type="text" name="array"/></td></tr>
            <tr><td>Player 3:   </td><td><input type="text" name="array"/></td></tr>
            <tr><td>Player 4:   </td><td><input type="text" name="array"/></td></tr>
            <tr><td>Player 5:   </td><td><input type="text" name="array"/></td></tr>
            <tr><td>Player 6:   </td><td><input type="text" name="array"/></td></tr>
            <tr><td>Player 7:   </td><td><input type="text" name="array"/></td></tr>
            <tr><td>Player 8:   </td><td><input type="text" name="array"/></td></tr>
            <tr><td>Player 9:   </td><td><input type="text" name="array"/></td></tr>
            <tr><td>Player 10:  </td><td><input type="text" name="array"/></td></tr>
          </tbody>
        </table><br/>
        <button type="submit">add</button>
        <button onClick={toggleFormVisible}>cancel</button>
      </form>
    </div>
  )
}

export default NewGroupForm
