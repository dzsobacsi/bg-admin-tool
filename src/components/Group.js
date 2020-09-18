import React from 'react'
import dbService from '../services/services'

const Group = ({ gname }) => {
  const openGroupResults = async () => {
    const matches = await dbService.getGroupMatches(gname)
    console.log(matches)
  }

  return (
    <p onClick={openGroupResults}>{gname}</p>
  )
}

export default Group
