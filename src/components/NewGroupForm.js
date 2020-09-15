import React from 'react'
import dbService from '../services/services'

const NewGroupForm = ({ toggleFormVisible }) => {
  const createNewGroup = async (e) => {
    e.preventDefault()
    const groupName = e.target.gpname.value
    const inputArray = document.getElementsByName('array')
    console.log([...inputArray].map(i => i.value).filter(i => i.length))

    const playerIdPromises = [...inputArray]
      .map(inp => inp.value)
      .filter(i => i.length)
      .map(uname => dbService.getPlayerId(uname))
    const playerIds = await Promise.all(playerIdPromises)
    console.log(playerIds)

    const matchIdPromises = playerIds
      .map(pid => dbService.getMatchIds(pid, groupName))
    const matchIds = await Promise
      .all(matchIdPromises)
      .then(resArray => resArray.map(x => x.matchIds).flat())  // flat is not supported in IE

    console.log(matchIds)
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
