import React from 'react'
import dbService from '../services/services'

const NewGroupForm = ({ toggleFormVisible }) => {
  const createNewForm = (e) => {
    e.preventDefault()
    const inputArray = document.getElementsByName('array')
    console.log([...inputArray].map(i => i.value).filter(i => i.length))
    const idPromises = [...inputArray]
      .map(inp => inp.value)
      .filter(i => i.length)
      .map(uname => dbService.getPlayerId(uname))

    const playerIds = Promise.all(idPromises).then(r => console.log(r))
  }

  return (
    <div className="NewGroupForm">
      <form onSubmit={createNewForm}>
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
