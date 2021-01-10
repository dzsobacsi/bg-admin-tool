import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import GroupTable from './GroupTable'
import NewGroupForm from './NewGroupForm'
import NewMatchForm from './NewMatchForm'
import Results from './Results'
import Summary from './Summary'
import Filter from './Filter'
import dbService from '../services/services'
import { getPlayerIds } from '../services/helperfunctions'


const Main = ({ setNotifMessage, adminMode }) => {
  const [groups, setGroups] = useState([])
  const [formVisible, setFormVisible] = useState('')
  const [matches, setMatches] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [topPlayer, setTopPlayer] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [updatedMatches, setUpdatedMatches] = useState([])
  const [lastUpdate, setLastUpdate] = useState('')

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

    // If a match result is reversed in the DB, then we reverse it in the
    // results array as well
    results = results.map(r => {
      let newRes = { ...r, reversed: false }
      const currentMatch = matches.find(m => m.match_id === r.mid) // currentMatch is taken from the matches state
      if (currentMatch.reversed) {
        newRes.players.reverse()
        newRes.score.reverse()
        newRes.reversed = true
      }
      return newRes
    })

    // Calculating the next state of the matches array
    results.forEach(r => {
      const currentMatch = matches.find(m => m.match_id === r.mid)

      // If the match result changed since last update
      if (currentMatch.score1 !== r.score[0] || currentMatch.score2 !== r.score[1]) {
        changedMatches.push(r.mid)

        const updatedMatch = {
          match_id: r.mid,
          player1: r.players[1],
          player2: r.players[0],
          score1:  r.score[1],
          score2:  r.score[0],
          finished: r.finished,
          reversed: r.reversed,
        }
        console.log('updatedMatch: ', updatedMatch)

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

    const playerIds = await getPlayerIds(userNames)
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
    // In any case, the group is saved back to the DB, to refresh its date
    const groupIsFinished = nextStateMatches.every(m => m.finished)
    const groupToUpdate = groups.find(g => g.groupname === selectedGroup)
    const updatedGroup  = { ...groupToUpdate }

    if (groupIsFinished) {
      console.log('Group is finished!')
      updatedGroup.winner = topPlayer
      updatedGroup.username = topPlayer
      updatedGroup.finished = true
    }

    const savedGroup = await dbService.saveGroupToDb(updatedGroup)
    console.log('savedGroup', savedGroup)

    nextStateGroups = nextStateGroups
      .map(g => g.groupname === selectedGroup ? updatedGroup : g)

    setGroups(nextStateGroups)
    setMatches(nextStateMatches)
    setUpdatedMatches(changedMatches)
    setLastUpdate(new Date().toString())
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
                    setLastUpdate={setLastUpdate}
                    groupFilter={groupFilter}
                  />
                </>
              }
            </div><br/>
            {adminMode &&
              <Button
                variant='outline-success'
                onClick={() => setFormVisible('new-group')}
              >
                Add group
              </Button>
            }
            &nbsp;
            {adminMode &&
              <Button
                variant='outline-success'
                onClick={() => setFormVisible('new-match')}
              >
                Add match
              </Button>
            }
          </div>
        }
        {formVisible === 'new-group' &&
          <NewGroupForm
            setFormVisible={setFormVisible}
            setMatches={setMatches}
            groups={groups}
            setGroups={setGroups}
            setSelectedGroup={setSelectedGroup}
            setLastUpdate={setLastUpdate}
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
            <span id="lastupdate">Last update: {lastUpdate}</span><br/>
            <Button
              variant='outline-success'
              onClick={refreshResults}
              disabled={
                groups.find(g => g.groupname === selectedGroup) &&
                groups.find(g => g.groupname === selectedGroup).finished
              }
            >
              Refresh results
            </Button>
          </>
        }
      </div>
    </div>
  )
}

export default Main
