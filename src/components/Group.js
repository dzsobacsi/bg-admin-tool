import React from 'react'
import dbService from '../services/services'

const Group = ({ group, setMatches, setSelectedGroup }) => {
  const openGroupResults = async () => {
    const matches = await dbService.getGroupMatches(group.groupname)
    setSelectedGroup(group.groupname)
    setMatches(matches)
    //window.localStorage.setItem("group", group.groupname)
    //console.log(matches)
  }

  return (
    <tr>
      <td onClick={openGroupResults}>{group.groupname}</td>
      <td>{group.finished ? group.winner : 'ongoing'}</td>
    </tr>
  )
}

export default Group
