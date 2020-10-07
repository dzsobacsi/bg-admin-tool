import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import GroupTable from './GroupTable'
import NewGroupForm from './NewGroupForm'
import NewMatchForm from './NewMatchForm'
import Results from './Results'
import Summary from './Summary'
import Filter from './Filter'
import dbService from '../services/services'


const Main = ({ setNotifMessage, adminMode }) => {
  const [groups, setGroups] = useState([])
  const [formVisible, setFormVisible] = useState('')
  const [matches, setMatches] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [topPlayer, setTopPlayer] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [updatedMatches, setUpdatedMatches] = useState([])

  // Groups are loaded from the server and notifmessage is set.
  // Only once when the component is mounted
  useEffect(() => {
    dbService.getGroups().then(g => setGroups(g))
    setNotifMessage('Ready')
  }, [setNotifMessage])

  const refreshResults = async () => {
    setNotifMessage('Please wait...')
    let changedMatches = [] // I could call this NextStateUpdatedMatches but it is shorter this way :)
    let nextStateMatches = [...matches]
    let nextStateGroups = [...groups]

    // match IDs of unfinised matches are:
    const unfinishedMatches = matches
      .filter(m => !m.finished)
      .map(m => m.match_id)

    // fetch results of all the unfinised matches
    const matchResultPromises = unfinishedMatches
      .map(mid => dbService.getMatchResult(mid))

    let results = await Promise.all(matchResultPromises)
    results.forEach((r, i) => {
      // currentMatch is taken from the match state
      const currentMatch = matches.find(m => m.match_id === r.mid)
      let toReverse = false

      // If the match result changed since last update
      if (currentMatch.score1 !== r.score[0] || currentMatch.score2 !== r.score[1]) {
        changedMatches.push(r.mid)

        // if players are stored in the database in reversed order,
        // they have to be reveresed here too
        const playersInDb = [currentMatch.player1, currentMatch.player2]
        const playersFromDg = r.players
        if (JSON.stringify(playersInDb) !== JSON.stringify(playersFromDg)) {
          console.warn(`I have to reverse ${playersInDb[0]} and ${playersInDb[1]}`)
          toReverse = true
          results[i].players.reverse()
          results[i].score.reverse()
        }

        const updatedMatch = {
          match_id: r.mid,
          player1: r.players[toReverse ? 1 : 0],
          player2: r.players[toReverse ? 0 : 1],
          score1: r.score[toReverse ? 1 : 0],
          score2: r.score[toReverse ? 0 : 1],
          finished: r.finished
        }
        console.log('result: ', r)
        console.log('toReverse: ', toReverse)
        console.log('updatedMatch: ', updatedMatch)
        console.log('---------------------')

        nextStateMatches = nextStateMatches
          .map(m => m.match_id === r.mid ? updatedMatch : m)
      }
    })

    // Unchanged matches are filtered out
    results = results.filter(r => changedMatches.includes(r.mid))
    console.log('changed matches: ', results)

    // This block replaces usernames with user IDs
    let playersSet = new Set()
    results.forEach(m => {
      playersSet.add(m.players[0])
      playersSet.add(m.players[1])
    })

    const userNames = [...playersSet]
    if (userNames.some(un => typeof un === 'undefined')) {
      console.error('Some usernames are undefined')
      setNotifMessage('Something went wrong. Please, try again.')
      return
    }

    const playerIdPromises = userNames
      .map(uname => dbService.getPlayerId(uname))
    const playerIds = await Promise.all(playerIdPromises)
    if (playerIds.some(pid => typeof pid === 'undefined')) {
      console.error('Some player IDs are undefined')
      setNotifMessage('Something went wrong. Please, try again.')
      return
    }

    let players = {}
    userNames.forEach((un, i) => players[un] = playerIds[i])

    results = results.map(r => ({
      ...r,
      players: r.players.map(p => players[p])
    }))

    // Save updated matches to the database
    const saveRequestPromises = results
      .map(r => dbService.saveResultToDb(r, selectedGroup))

    const savedMatchResults = await Promise.all(saveRequestPromises)
    console.log('saved results', savedMatchResults)
    setNotifMessage(
      `${savedMatchResults.length} match${savedMatchResults.length > 1 ? 'es were' : ' was'} changed and saved to the database.`
    )

    // Check if all the matches are finished
    // and update the group table if they are
    const groupIsFinished = nextStateMatches.every(m => m.finished)
    if (groupIsFinished) {
      console.log('Group is finished!')
      const groupToUpdate = groups.find(g => g.groupname === selectedGroup)
      const updatedGroup = {
        ...groupToUpdate,
        winner: topPlayer,
        username: topPlayer,
        finished: true
      }

      const savedGroup = await dbService.saveGroupToDb(updatedGroup)
      console.log('savedGroup', savedGroup)

      nextStateGroups = nextStateGroups
        .map(g => g.groupname === selectedGroup ? updatedGroup : g)
    }

    setGroups(nextStateGroups)
    setMatches(nextStateMatches)
    setUpdatedMatches(changedMatches)
  }

  const handleFilterChange = e => setGroupFilter(e.target.value)

  return (
    <div className="Main">
      <div className="box-1">
        {!formVisible &&
          <div>
            <div id="grouplist">
              { groups.length === 0 ? 'Loading...' :
                <>
                  <Filter
                    groupFilter={groupFilter}
                    handleFilterChange={handleFilterChange}
                  />
                  <GroupTable
                    groups={groups}
                    setMatches={setMatches}
                    setUpdatedMatches={setUpdatedMatches}
                    setSelectedGroup={setSelectedGroup}
                    groupFilter={groupFilter}
                  />
                </>
              }
            </div><br/>
            <Button
              variant='outline-success'
              onClick={() => setFormVisible('new-group')}
              disabled={!adminMode}>
              Add group
            </Button>&nbsp;
            <Button
              variant='outline-success'
              onClick={() => setFormVisible('new-match')}
              disabled={!adminMode}>
              Add match
            </Button>
          </div>
        }
        {formVisible === 'new-group' &&
          <NewGroupForm
            setFormVisible={setFormVisible}
            setMatches={setMatches}
            groups={groups}
            setGroups={setGroups}
            setSelectedGroup={setSelectedGroup}
            setNotifMessage={setNotifMessage}
          />
        }
        {formVisible === 'new-match' &&
          <NewMatchForm
            setFormVisible={setFormVisible}
            matches={matches}
            setMatches={setMatches}
            groups={groups}
            setNotifMessage={setNotifMessage}
          />
        }
      </div>
      <div className="box-2">
        {matches.length === 0 && <h5><b>Select a group on the left</b></h5>}
        {matches.length > 0 &&
          <>
            <h3>{selectedGroup}</h3>
            <Summary matches={matches} setTopPlayer={setTopPlayer}/>
            <Results matches={matches} updatedMatches={updatedMatches}/>
            <Button variant='outline-success' onClick={refreshResults}>
              Refresh results
            </Button>
          </>
        }
      </div>
    </div>
  )
}

export default Main
