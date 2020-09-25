import axios from 'axios'

const baseUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : ''

const login = async (user) => {
  const url = baseUrl + '/login'
  try {
    const response = await axios.post(url, user)
    return response
  } catch (e) {
    console.error(e.message)
  }
}

export default { login }
