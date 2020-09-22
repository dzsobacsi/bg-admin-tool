import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Group from './Group'
import NewGroupForm from './NewGroupForm'
import NewMatchForm from './NewMatchForm'
import Results from './Results'
import Summary from './Summary'
import dbService from '../services/services'


const Main = ({ setNotifMessage }) => {
  const [groups, setGroups] = useState(['loading...'])
  const [formVisible, setFormVisible] = useState('')
  const [matches, setMatches] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')

  useEffect(() => {
    dbService.getGroups().then(g => setGroups(g))
    setNotifMessage("Existing gropus are loaded")
  }, [setNotifMessage])

  return (
    <div className="Main">
      <div className="box-1">
        {!formVisible &&
          <div>
            <div id="grouplist">
              {groups.sort().map(g => <Group
                key={g}
                gname={g}
                setMatches={setMatches}
                setSelectedGroup={setSelectedGroup}/>)
              }
            </div><br/>
            <Button
              variant='outline-success'
              onClick={() => setFormVisible('new-group')}>
              Add group
            </Button>&nbsp;
            <Button
              variant='outline-success'
              onClick={() => setFormVisible('new-match')}>
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
          />
        }
        {formVisible === 'new-match' &&
          <NewMatchForm
            setFormVisible={setFormVisible}
            setMatches={setMatches}
          />
        }
      </div>
      <div className="box-2">
        {matches.length === 0 && <h5><b>Select a group on the left</b></h5>}
        {matches.length > 0 && <h3>{selectedGroup}</h3>}
        {matches.length > 0 && <Summary matches={matches} />}
        {matches.length > 0 && <Results matches={matches} />}
      </div>
    </div>
  )
}

export default Main
