import React, { useState, useEffect } from 'react'
import Group from './Group'
import dbService from '../services/queries'
import './Main.css'

const Main = (props) => {
  const [groups, setGroups] = useState(['test1', 'test2'])

  useEffect(() => {
    console.log('useEffect started');
    dbService.getGroups().then(g => setGroups(g))
  }, [])

  return (
    <div className="Main">
      <div className="box-1">
        <b>Existing groups</b>
        {groups.map(g => <Group key={g} gname={g}/>)}
      </div>
      <div className="box-2">
        something else
      </div>
    </div>
  )
}

export default Main
