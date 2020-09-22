import React from 'react'
import TextInput from './TextInput'
import dbService from '../services/services'

const NewMatchForm = ({ setFormVisible }) => {
  const addNewMatch = async (e) => {
    e.preventDefault()
    const groupName = e.target.gpname.value

    let matchResult = await dbService.getMatchResult(e.target.mid.value)
    //console.log(matchResult)

    const playerIdPromises = matchResult.players
      .map(uname => dbService.getPlayerId(uname))
    const playerIds = await Promise.all(playerIdPromises)
    //console.log(playerIds)

    matchResult.players = playerIds
    //console.log(matchResult)

    if (window.confirm(`Do you want to save the match
${JSON.stringify(matchResult)}
to the database?`)) {
        const savedResult = await dbService.saveResultToDb(matchResult, groupName)
        setFormVisible('')
        console.log(savedResult)
    }
  }

  return (
    <div className="new-group-form">
      <form onSubmit={addNewMatch}>
        <table>
          <tbody>
            <TextInput label='Match ID' name='mid'/>
            <TextInput label='Group' name='gpname'/>
          </tbody>
        </table><br/>
        <button type="submit">add</button>&nbsp;
        <button onClick={() => setFormVisible('')}>cancel</button>
      </form>
    </div>
  )
}

export default NewMatchForm
