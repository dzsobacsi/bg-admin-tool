import React from 'react'
import Group from './Group'
import { sortGroups } from '../services/helperfunctions'

const GroupTable = ({
  groups, setMatches, setSelectedGroup, groupFilter, setUpdatedMatches, setLastUpdate
}) => {
  return (
    <table className='groups-table'>
      <thead>
        <tr>
          <td><b>Group name</b></td>
          <td><b>Winner</b></td>
        </tr>
      </thead>
      <tbody>
        {groups.filter(
            g => g.groupname
              .toLowerCase()
              .includes(groupFilter.toLowerCase()) 
            || 
            g.players
              .map(p => p.toLowerCase())
              .some(p => p.includes(groupFilter.toLowerCase()))
          )
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
