import React from 'react'

const TextInput = ({ label, name }) => (
  <tr>
    <td>{label}: </td>
    <td><input type="text" name={name} size="24"/></td>
  </tr>
)

export default TextInput
