import React, { useEffect } from 'react'
import TableRow from './TableRow'

const Summary = ({ matches, setTopPlayer }) => {
  useEffect(() => {
    setTopPlayer(tableToRender[0][0].value)
  })

  //create an array of players
  let playersSet = new Set()
  matches.forEach(m => {
    playersSet.add(m.player1)
    playersSet.add(m.player2)
  })
  const players = [...playersSet]

  const columnLabels = [
    'finished', 'won', 'lost', '% won', '+', '-', 'total', '+', '-', 'total'
  ]
  const columnRefs = [
    'fin', 'won', 'lost', 'percwon', 'plsall', 'minall', 'totall', 'plsfin', 'minfin', 'totfin'
  ]

  let rowTemplate = {}
  columnRefs.forEach(c => rowTemplate[c] = 0)

  let summaryTable = {}
  players.forEach(p => summaryTable[p] = { player: p, ...rowTemplate })
  matches.forEach(m => {
    // Only if finihsed
    if (m.finished) {
      const winner = m.score1 === 11 ? 0 : 1
      const ply = [m.player1, m.player2]
      summaryTable[m.player1].fin++
      summaryTable[m.player2].fin++
      summaryTable[ply[winner]].won++
      summaryTable[ply[1 - winner]].lost++
      summaryTable[m.player1].plsfin += m.score1
      summaryTable[m.player2].plsfin += m.score2
      summaryTable[m.player1].minfin += m.score2
      summaryTable[m.player2].minfin += m.score1
      summaryTable[m.player1].totfin += m.score1 - m.score2
      summaryTable[m.player2].totfin += m.score2 - m.score1
    }
    // either finished or not
    summaryTable[m.player1].plsall += m.score1
    summaryTable[m.player2].plsall += m.score2
    summaryTable[m.player1].minall += m.score2
    summaryTable[m.player2].minall += m.score1
    summaryTable[m.player1].totall += m.score1 - m.score2
    summaryTable[m.player2].totall += m.score2 - m.score1
  })

  const numOfMatchesPerPlayer = (players.length - 1) * 2
  players.forEach(p => {
    //Set %won column
    summaryTable[p].percwon = summaryTable[p].fin
      ? Math.round(summaryTable[p].won / summaryTable[p].fin * 100)
      : '---'
    //Update finished column to xx/numOfMatchesPerPlayer
    summaryTable[p].fin = `${summaryTable[p].fin} / ${numOfMatchesPerPlayer}`
  })

  let tableToRender = Object.values(summaryTable)
    .sort((a, b) => b.won - a.won || b.totall - a.totall || b.totfin - a.totfin)
    .map(row => Object.values(row))
    .map(row => row.map(
      (data, i) => ({ value: data, class: i ? 'default' : 't-header' })
    ))

  return (
    <table className='summary-table'>
      <thead>
        <tr>
          <td colSpan="5"></td>
          <td colSpan="3"><b>all matches</b></td>
          <td colSpan="3"><b>finished matches</b></td>
        </tr>
        <tr>
          {['', ...columnLabels]
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
