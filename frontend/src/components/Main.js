import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import GroupTable from './GroupTable'
import NewGroupForm from './NewGroupForm'
import NewMatchForm from './NewMatchForm'
import AddByBatchForm from './AddByBatchForm'
import Results from './Results'
import Summary from './Summary'
import Filter from './Filter'
import { getGroups, getGroupMatches, saveGroupToDb, getDate } from '../services/services'
import {
  getMatchResultsFromDg,
  processResultObjects,
  swapResult,
  saveMatchesToDb,
} from '../services/helperfunctions'


const Main = ({ setNotifMessage, adminMode }) => {
  const [groups, setGroups] = useState([])
  const [formVisible, setFormVisible] = useState('')
  const [matches, setMatches] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [topPlayer, setTopPlayer] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [updatedMatches, setUpdatedMatches] = useState([])
  const [lastUpdate, setLastUpdate] = useState('')
  const endOfSeason = new Date(Date.UTC(2024, 1, 24, 21))  // Y, M, D, hh, UTC, Jan = 0, Dec = 11

  // Groups are loaded from the server and notifmessage is set.
  // Only once when the component is mounted
  useEffect(() => {
    getGroups().then(g => setGroups(g))
    setNotifMessage('Ready')
  }, [setNotifMessage])

  const refreshResults = async () => {
    const serverTimeStr = await getDate()
    const serverTime = new Date(serverTimeStr)
    console.log('serverTime: ', serverTime)
    console.log('endOfSeason: ', endOfSeason)
    console.log('season is already ended? ', serverTime > endOfSeason)
    if(serverTime > endOfSeason) {
      setNotifMessage('The season is already ended. Final result tables are to be published soon.')
      return
    }

    setNotifMessage('Please wait...')

    // match IDs of unfinised matches are:
    const unfinishedMatches = matches
      .filter(m => !m.finished)
      .map(m => m.match_id)

    let results = await getMatchResultsFromDg(unfinishedMatches)
    results = await processResultObjects(results)
    if (!results) {
      setNotifMessage('Something went wrong. Please, try again.')
      return
    }

    // If a match result is reversed in the DB, then it has to be reversed in
    // the results array as well
    results = results.map(r => {
      let newRes = { ...r }
      const currentMatch = matches.find(m => m.match_id === r.mid) // currentMatch is taken from the matches state
      if (currentMatch.reversed) {
        newRes = swapResult(newRes)
      }
      return newRes
    })

    // find and save the changed matches
    const changedMatches = []
    results.forEach(r => {
      const currentMatch = matches.find(m => m.match_id === r.mid)
      if (currentMatch.score1 !== r.score[0] || currentMatch.score2 !== r.score[1]) {
        changedMatches.push(r.mid)
      }
    })

    // Unchanged matches are filtered out
    results = results.filter(r => changedMatches.includes(r.mid))
    console.log('changed matches: ', results)

    // Save updated matches to the database
    const savedMatchResults = await saveMatchesToDb(results, selectedGroup)
    console.log('saved results: ', savedMatchResults)

    const nextStateMatches = await getGroupMatches(selectedGroup)

    // Check if all the matches are finished
    // and update the group table if they are
    // In any case, the group is saved back to the DB, to refresh its date
    const groupIsFinished = nextStateMatches.every(m => m.finished)
    const groupToUpdate = groups.find(g => g.groupname === selectedGroup)
    const updatedGroup  = { ...groupToUpdate }

    if (groupIsFinished) {
      console.log('Group is finished!')
      updatedGroup.winner = topPlayer
      updatedGroup.finished = true
    }

    const savedGroup = await saveGroupToDb(updatedGroup)
    console.log('savedGroup: ', savedGroup)

    const nextStateGroups = groups
      .map(g => g.groupname === selectedGroup ? updatedGroup : g)

    setGroups(nextStateGroups)
    setMatches(nextStateMatches)
    setUpdatedMatches(changedMatches)
    setLastUpdate(new Date().toString())
    setNotifMessage(
      `${savedMatchResults.length} match${savedMatchResults.length > 1 ? 'es were' : ' was'} changed and saved to the database.`
    )
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
                Add group - player names
              </Button>
            }
            &nbsp;
            {adminMode &&
              <Button
                variant='outline-success'
                onClick={() => setFormVisible('add-by-batch')}
              >
                Add group - match IDs
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
            selectedGroup={selectedGroup}
            setNotifMessage={setNotifMessage}
          />
        }
        {formVisible === 'add-by-batch' &&
          <AddByBatchForm
            setFormVisible={setFormVisible}
            setMatches={setMatches}
            groups={groups}
            setGroups={setGroups}
            setSelectedGroup={setSelectedGroup}
            setLastUpdate={setLastUpdate}
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
            <br/>
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
