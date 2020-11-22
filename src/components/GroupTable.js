import React from 'react'
import Group from './Group'

const GroupTable = ({
  groups, setMatches, setSelectedGroup, groupFilter, setUpdatedMatches, setLastUpdate
}) => {
  const sortGroups = (a, b) => b.season - a.season || a.groupname.localeCompare(b.groupname)

  return (
    <table className='groups-table'>
      <thead>
        <tr>
          <td><b>Group name</b></td>
          <td><b>Winner</b></td>
        </tr>
      </thead>
      <tbody>
        {groups
          .filter(g => g.groupname
            .toLowerCase()
            .includes(groupFilter.toLowerCase()))
          .sort(sortGroups)
          .map((g, i) => <Group
            key={i}
            group={g}
            setMatches={setMatches}
            setUpdatedMatches={setUpdatedMatches}
            setSelectedGroup={setSelectedGroup}
            setLastUpdate={setLastUpdate}
          />)
        }
      </tbody>
    </table>
  )
}

export default GroupTable
