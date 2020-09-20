import React from 'react'

const TableRow = ({ data }) => (
  <tr>
    {data.map((td, i) => (<td key={i} className={td.class}>{td.value}</td>))}
  </tr>
)

export default TableRow
