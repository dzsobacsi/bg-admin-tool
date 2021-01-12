import React from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import dbService from '../services/services'
import {
  getMatchResultsFromDg,
  processResultObjects,
  handleDuplicates,
  saveMatchesToDb,
} from '../services/helperfunctions'

const AddByBatchForm = ({
  setFormVisible,
  setMatches,
  groups,
  setGroups,
  setSelectedGroup,
  setLastUpdate,
  setNotifMessage
}) => {
  const addMatches = async (e) => {
    e.preventDefault()

    const groupName = e.target.groupname.value
    const matchIds = e.target.matchids.value.split('\n')
    console.log(matchIds)

    let results = await getMatchResultsFromDg(matchIds)
    results = await processResultObjects(results)
    if (!results) {
      setNotifMessage('Something went wrong. Please, try again.')
      return
    }
    results = handleDuplicates(results)

    if (results.length && window.confirm(
      `Do you want to save the group ${groupName} and ${results.length} matches to the database?`
    )) {
      // save the new group to the database
      const addedGroup = await dbService.saveGroupToDb({ groupname: groupName })
      console.log(addedGroup)

      // save the results to the database
      const savedMatchResults = await saveMatchesToDb(results, groupName)
      console.log(savedMatchResults)

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

  return (
    <div className="new-group-form">
      <Form onSubmit={addMatches}>
        <Form.Group>
          <Form.Row>
            <p style={{ color: 'red' }}>Use this form as an alternative to Add Group. Delete existing group before submit!</p>
            <Form.Label column="lg" lg={8}>Group name</Form.Label>
            <Form.Control size="sm" name="groupname" />
          </Form.Row>
          <Form.Row>
            <Form.Label column="lg" lg={8}>Match IDs - one per line</Form.Label>
            <Form.Control as="textarea" rows={3} name="matchids" />
          </Form.Row>
          <Form.Row>
            <Button variant='outline-success' type="submit">add</Button>&nbsp;
            <Button variant='outline-secondary' onClick={() => setFormVisible('')}>
              cancel
            </Button>
          </Form.Row>
        </Form.Group>
      </Form>
    </div>
  )
}

export default AddByBatchForm
