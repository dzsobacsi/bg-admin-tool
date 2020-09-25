import React from 'react'
import Button from 'react-bootstrap/Button'
import TextInput from './TextInput'
import dbService from '../services/services'

const NewMatchForm = ({ setFormVisible, setMatches, groups, setNotifMessage }) => {
  setNotifMessage('Please wait...')
  const addNewMatch = async (e) => {
    e.preventDefault()
    const groupName = e.target.gpname.value
    //console.log(groupName)

    let matchResult = await dbService.getMatchResult(
        e.target.mid.value, window.localStorage.getItem('login-cookie')
      )
    //console.log(matchResult)

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

        const matches = await dbService.getGroupMatches(groupName)
        setMatches(matches)
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
