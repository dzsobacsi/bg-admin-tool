import React from 'react'

const Group = ({ gname }) => {
  const openGroupResults = () => {
    console.log(`${gname} clicked`)
  }

  return (
    <p onClick={openGroupResults}>{gname}</p>
  )
}

export default Group
