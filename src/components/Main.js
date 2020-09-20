import React, { useState, useEffect } from 'react'
import Group from './Group'
import NewGroupForm from './NewGroupForm'
import Results from './Results'
import Summary from './Summary'
import dbService from '../services/services'
import './Main.css'

const Main = ({ setNotifMessage }) => {
  const [groups, setGroups] = useState(['loading...'])
  const [formVisible, setFormVisible] = useState(false)
  const [matches, setMatches] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')

  useEffect(() => {
    dbService.getGroups().then(g => setGroups(g))
    setNotifMessage("Existing gropus are loaded")
  }, [setNotifMessage])

  const toggleFormVisible = () => {
    setFormVisible(!formVisible)
  }

  return (
    <div className="Main">
      <div className="box-1">
        {!formVisible &&
          <div>
            <div id="grouplist">
              {groups.map(g => <Group
                key={g}
                gname={g}
                setMatches={setMatches}
                setSelectedGroup={setSelectedGroup}/>)
              }
            </div><br/>
            <button onClick={toggleFormVisible}>Add new group</button><br/>
          </div>
        }
        {formVisible &&
          <NewGroupForm toggleFormVisible={toggleFormVisible}/>
        }
      </div>
      <div className="box-2">
        {matches.length > 0 && <h3>{selectedGroup}</h3>}
        {matches.length > 0 && <Summary matches={matches} />}
        {matches.length > 0 && <Results matches={matches} />}
      </div>
    </div>
  )
}

export default Main
