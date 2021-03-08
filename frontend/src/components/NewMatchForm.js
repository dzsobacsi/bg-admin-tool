import React from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import { saveResultToDb, getGroupMatches } from '../services/services'
import {
  getMatchResultsFromDg,
  processResultObjects,
  swapResult,
} from '../services/helperfunctions'

const NewMatchForm = ({
  setFormVisible, matches, setMatches, selectedGroup, setNotifMessage
}) => {
  const addNewMatch = async (e) => {
    setNotifMessage('Please wait...')
    e.preventDefault()

    const matchResults = await getMatchResultsFromDg([e.target.mid.value])
    const processedResults = await processResultObjects(matchResults)
    if (!processedResults) {
      setNotifMessage('Something went wrong. Please, try again.')
      return
    }
    let matchResult = processedResults[0]
    //matchResult is an object with the following keys:
    // mid, players[2], score[2], groupname, finished

    // reverse the 2 players if they have a match already
    if (matches.find(
      m => JSON.stringify([m.player1, m.player2]) === JSON.stringify(matchResult.playerNames))
    ) {
      matchResult = swapResult(matchResult)
      console.warn('players are reversed')
    }

    if (matchResult.playerNames[0] && window.confirm(`Do you really want to save the match
${JSON.stringify(matchResult)}
to the database?`)) {
      const savedResult = await saveResultToDb(matchResult, selectedGroup)
      const matchesFromDb = await getGroupMatches(selectedGroup)

      setMatches(matchesFromDb)
      setFormVisible('')
      console.log(savedResult)
      setNotifMessage('Match is saved to the database')
    } else if (!matchResults.length) {
      setNotifMessage('No match was found. Enter valid match ID.')
    } else {
      setNotifMessage('Operation cancelled')
    }
  }

  return (
    <div className="new-group-form">
      {!selectedGroup && <h4 style={{ color: 'red' }}>Please, select a group on the main page!</h4>}
      <Form onSubmit={addNewMatch}>
        <Form.Group>
          <Form.Row>
            <Form.Label column="lg" lg={12}>Selected Group: {selectedGroup}</Form.Label>
          </Form.Row>
          <Form.Row>
            <Form.Label column="lg" lg={3}>Match ID</Form.Label>
            <Col>
              <Form.Control type="number" size="sm" name="mid" />
            </Col>
          </Form.Row>
          <Form.Row>
            <Button variant='outline-success' type="submit" disabled={!selectedGroup}>add</Button>&nbsp;
            <Button variant='outline-secondary' onClick={() => setFormVisible('')}>
              cancel
            </Button>
          </Form.Row>
        </Form.Group>
      </Form>
    </div>
  )
}

export default NewMatchForm
