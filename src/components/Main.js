import React, { useState, useEffect } from 'react'
import Group from './Group'
import NewGroupForm from './NewGroupForm'
import dbService from '../services/services'
import './Main.css'

const Main = ({ setNotifMessage }) => {
  const [groups, setGroups] = useState(['loading...'])
  const [formVisible, setFormVisible] = useState(false)

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
            <button onClick={toggleFormVisible}>Add new group</button><br/>
            <p><b>Existing groups</b></p>
            <div id="grouplist">
              {groups.map(g => <Group key={g} gname={g}/>)}
            </div>
          </div>
        }
        {formVisible &&
          <NewGroupForm toggleFormVisible={toggleFormVisible}/>
        }
      </div>
      <div className="box-2">
        Select a group on the left
      </div>
    </div>
  )
}

export default Main
