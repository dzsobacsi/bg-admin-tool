import React from 'react'

const Filter = ({ groupFilter, handleFilterChange }) => (
  <div>
    filter: <input
      size={23}
      value={groupFilter}
      onChange={handleFilterChange}
    /><br/>
  </div>
)

export default Filter
