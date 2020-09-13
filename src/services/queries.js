import axios from 'axios'

//const url =

const getGroups = async () => {
  try {
    console.log('getGroups try');
    const response = await axios.get('/groups')
    console.log(response);
    return response.data
  } catch (e) {
    console.log('getGroups err');
    console.error(e.message)
  }
}

export default { getGroups }
