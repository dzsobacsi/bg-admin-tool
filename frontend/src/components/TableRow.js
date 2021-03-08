import React from 'react'

// data = {value, class, mid, link}
// updatedMatches = [mid]

const TableRow = ({ data, updatedMatches }) => (
  <tr>
    {data.map((td, i) => td.link
      ? (
        <td
          key={i}
          bgcolor={updatedMatches && updatedMatches.includes(td.mid)
            ? '#ffffd4'
            : 'white'}
        >
          <a
            href={td.link}
            className={td.class}
            target="_blank"
            rel="noopener noreferrer"
          >
            {td.value}
          </a>
        </td>
      )
      : (<td key={i} className={td.class}>{td.value}</td>))}
  </tr>
)

export default TableRow
