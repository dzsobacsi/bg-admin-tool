import React from 'react'
import Group from './Group'

const GroupTable = ({ groups, setMatches, setSelectedGroup, groupFilter }) => (
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
        .sort((a, b) => a.groupname.localeCompare(b.groupname))
        .map((g, i) => <Group
          key={i}
          group={g}
          setMatches={setMatches}
          setSelectedGroup={setSelectedGroup}
        />)
      }
    </tbody>
  </table>
)

export default GroupTable
