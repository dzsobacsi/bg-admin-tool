import React from 'react'
import dbService from '../services/services'

const Group = ({ gname, setMatches, setSelectedGroup }) => {
  const openGroupResults = async () => {
    const matches = await dbService.getGroupMatches(gname)
    setSelectedGroup(gname)
    setMatches(matches)
    //console.log(matches)
  }

  return (
    <p onClick={openGroupResults}>{gname}</p>
  )
}

export default Group
