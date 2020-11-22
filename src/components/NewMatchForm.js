import React from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import dbService from '../services/services'
import { sortGroups } from '../services/helperfunctions'

// groups = {groupname, groupid, finished, winner, user_id, username}

const NewMatchForm = ({
  setFormVisible, matches, setMatches, groups, setNotifMessage
}) => {
  const addNewMatch = async (e) => {
    setNotifMessage('Please wait...')
    e.preventDefault()
    const groupName = e.target.gpname.value
    //console.log(groupName)

    let matchResult = await dbService.getMatchResult(e.target.mid.value)
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
      .map(uname => dbService.getPlayerId(uname))

    const playerIds = await Promise.all(playerIdPromises)
    //console.log(playerIds)

    if (matchResult.players[0] && window.confirm(`Do you really want to save the match
${JSON.stringify(matchResult)}
to the database?`)) {
      matchResult.players = playerIds
      const savedResult = await dbService.saveResultToDb(matchResult, groupName)

      const matchesFromDb = await dbService.getGroupMatches(groupName)
      setMatches(matchesFromDb)
      setFormVisible('')
      console.log(savedResult)
      setNotifMessage('Match is saved to the database')
    } else {
      setNotifMessage('No match was found. Enter valid match ID.')
    }
  }

  return (
    <div className="new-group-form">
      <Form onSubmit={addNewMatch}>
        <Form.Group>
          <Form.Row>
            <Form.Label column="lg" lg={3}>Match ID</Form.Label>
            <Col>
              <Form.Control type="number" size="sm" name="mid" />
            </Col>
          </Form.Row>
          <Form.Row>
            <Form.Label column="lg" lg={3}>Group</Form.Label>
            <Col>
              <Form.Control as="select" size="sm" name="gpname">
                {groups
                  .sort(sortGroups)
                  .map((g, i) => (
                    <option key={i}>{g.groupname}</option>
                  ))}
              </Form.Control>
            </Col>
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

export default NewMatchForm
