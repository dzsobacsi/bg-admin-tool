import React from 'react'
import Button from 'react-bootstrap/Button'
import TextInput from './TextInput'
import { saveGroupToDb, getGroupMatches } from '../services/services'
import {
  getPlayerIds,
  registerMissingPlayers,
  getMatchIds,
  getMatchResultsFromDg,
  processResultObjects,
  handleDuplicates,
  saveMatchesToDb,
  seasonFromGroupName,
} from '../services/helperfunctions'

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

    registerMissingPlayers(userNames)
    let playerIds = await getPlayerIds(userNames)
    console.log(playerIds)

    const matchIds = await getMatchIds(playerIds, groupName)
    console.log(matchIds)

    //fetch match results
    let results = await getMatchResultsFromDg(matchIds)
    results = results.filter(
      r => userNames.includes(r.playerNames[0]) && userNames.includes(r.playerNames[1])
    )
    results = await processResultObjects(results, false)
    if (!results) {
      setNotifMessage('Something went wrong. Please, try again.')
      return
    }
    console.log(results)

    results = handleDuplicates(results)

    //save the group and the match results to the database
    const expectedNrOfMatches = playerIds.length * (playerIds.length - 1)
    if (results.length && window.confirm(
      `${playerIds.length} out of ${userNames.length} users were found.
${results.length} out of ${expectedNrOfMatches} matches were found.
Do you want to save the results to the database?`
    )) {
      // save the new group to the database
      const addedGroup = await saveGroupToDb({
        groupname: groupName,
        season: seasonFromGroupName(groupName),
      })
      console.log(addedGroup)

      // save the results to the database
      const savedMatchResults = await saveMatchesToDb(results, groupName)
      console.log(savedMatchResults)

      const matches = await getGroupMatches(groupName)
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
