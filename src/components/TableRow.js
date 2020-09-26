import React from 'react'

const TableRow = ({ data }) => (
  <tr>
    {data.map((td, i) => td.link
      ? (<td key={i}>
          <a href={td.link} className={td.class} target="_blank" rel="noopener noreferrer">{td.value}</a>
        </td>)
      : (<td key={i} className={td.class}>{td.value}</td>))}
  </tr>
)

export default TableRow
