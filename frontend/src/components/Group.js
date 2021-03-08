import React from 'react'
import { getGroupMatches } from '../services/services'

const Group = ({
  group, setMatches, setSelectedGroup, setUpdatedMatches, setLastUpdate
}) => {
  const openGroupResults = async () => {
    const matches = await getGroupMatches(group.groupname)
    const niceDate = new Date(matches[0].lastupdate).toString()

    setUpdatedMatches([])
    setSelectedGroup(group.groupname)
    setLastUpdate(niceDate)
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
