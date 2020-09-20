import React from 'react'
import TableRow from './TableRow'

const Summary = ({ matches }) => {
  //create an array of players
  let playersSet = new Set()
  matches.forEach(m => {
    playersSet.add(m.player1)
    playersSet.add(m.player2)
  })
  const players = [...playersSet]

  const columns = ['finished', 'won', 'lost', '+', '-', 'total']

  let rowTemplate = {}
  columns.forEach(c => rowTemplate[c] = 0)

  let summaryTable = {}
  players.forEach(p => summaryTable[p] = { player: p, ...rowTemplate })
  matches.forEach(m => {
    if (m.finished) {
      const winner = m.score1 === 11 ? 0 : 1
      const ply = [m.player1, m.player2]
      summaryTable[m.player1].finished++
      summaryTable[m.player2].finished++
      summaryTable[ply[winner]].won++
      summaryTable[ply[1 - winner]].lost++
      summaryTable[m.player1]['+'] += m.score1
      summaryTable[m.player2]['+'] += m.score2
      summaryTable[m.player1]['-'] += m.score2
      summaryTable[m.player2]['-'] += m.score1
      summaryTable[m.player1].total += m.score1 - m.score2
      summaryTable[m.player2].total += m.score2 - m.score1
    }
  })

  let tableToRender = Object.values(summaryTable)
    .sort((a, b) => b.won - a.won || b.sort - a.sort)
    .map(row => Object.values(row))
    .map(row => row.map(
      (data, i) => ({value: data, class: i ? 'default' : 't-header'})
    ))
  console.log(tableToRender)

  return (
    <table className='summary-table'>
      <thead>
        <tr>
          {['player', ...columns]
            .map((c, i) => (<td key={i} className='t-header'>{c}</td>))}
        </tr>
      </thead>
      <tbody>
        {tableToRender.map((row, i) => <TableRow key={i} data={row}/>)}
      </tbody>
    </table>
  )
}

export default Summary
