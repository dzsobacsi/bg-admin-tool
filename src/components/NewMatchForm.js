import React from 'react'
import Button from 'react-bootstrap/Button'
import TextInput from './TextInput'
import dbService from '../services/services'

const NewMatchForm = ({
   setFormVisible, matches, setMatches, groups, setNotifMessage
 }) => {
  setNotifMessage('Please wait...')
  const addNewMatch = async (e) => {
    e.preventDefault()
    const groupName = e.target.gpname.value
    //console.log(groupName)

    let matchResult = await dbService.getMatchResult(
      e.target.mid.value, window.localStorage.getItem('login-cookie')
    )
    //matchResult is an object with the following keys:
    // mid, players[2], score[2], groupname, finished
    //console.log(matchResult)

    // reverse the 2 players if they have a match already
    if (matches.find(
      m => JSON.stringify([m.player1, m.player2]) === JSON.stringify(matchResult.players))
    ) {
      matchResult.players = matchResult.players.reverse()
      matchResult.score = matchResult.score.reverse()
      console.warn('players are reversed')
    }

    // get the player IDs
    const playerIdPromises = matchResult.players
      .map(uname => dbService
        .getPlayerId(uname, window.localStorage.getItem('login-cookie')))
    const playerIds = await Promise.all(playerIdPromises)
    //console.log(playerIds)

    if (window.confirm(`Do you want to save the match
${JSON.stringify(matchResult)}
to the database?`)) {
        matchResult.players = playerIds
        const savedResult = await dbService.saveResultToDb(matchResult, groupName)

        const matchesFromDb = await dbService.getGroupMatches(groupName)
        setMatches(matchesFromDb)
        setFormVisible('')
        console.log(savedResult)
        setNotifMessage('Match is saved to the database')
    }
  }

  return (
    <div className="new-group-form">
      <form onSubmit={addNewMatch}>
        <table>
          <tbody>
            <TextInput label='Match ID' name='mid'/>
            <tr>
              <td>Group: </td>
              <td>
                <select name='gpname'>
                  {groups.map((g, i) => (<option key={i} value={g}>{g}</option>))}
                </select>
              </td>
            </tr>
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

export default NewMatchForm
