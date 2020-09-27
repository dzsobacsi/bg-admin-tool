import React from 'react'
import TableRow from './TableRow'

const Results = ({ matches }) => {
  // matches come from the database and it has the keys:
  // match_id, player1, player2, score1, score2, finished
  // and players are strings with usernames

  //create an array of players
  let playersSet = new Set()
  matches.forEach(m => {
    playersSet.add(m.player1)
    playersSet.add(m.player2)
  })
  let players = [...playersSet]
   .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))

  // Create a player-index object
  const tableSize = players.unshift('')
  let pi = {}
  players.forEach((p, i) => pi[p] = i)

  // Create an empty 2D array
  let matchResultsTable = new Array(tableSize)
    .fill()
    .map(a => new Array(tableSize).fill(''))

  // Fill the table with players name and with match results
  players.forEach((p, i) => {
    matchResultsTable[0][i] = {value: p, class: 't-header'}
    matchResultsTable[i][0] = {value: p, class: 't-header'}
  })
  for (let i = 1; i < tableSize; i++) {
    matchResultsTable[i][i] = {value: '-----', class: 'diagonal'}
  }
  matches.forEach(m => {
    matchResultsTable[pi[m.player1]][pi[m.player2]] = {
      value: `${m.score1} : ${m.score2}`,
      class: m.finished ? 'finished' : 'ongoing',
      link: `http://dailygammon.com/bg/game/${m.match_id}/0/list#end`
    }
  })

  return (
    <table className='results-table'>
      <tbody>
        {matchResultsTable.map((row, i) => <TableRow key={i} data={row}/>)}
      </tbody>
    </table>
  )
}

export default Results
