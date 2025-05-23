import axios from 'axios'

const baseUrl = 'https://cursofullstack-h15w--3001--4d9fd228.local-credentialless.webcontainer.io/persons'

const getAll = () => {
  return axios.get(baseUrl).then(response => response.data)
}

const create = (newPerson) => {
  return axios.post(baseUrl, newPerson).then(response => response.data)
}

const remove = (id) => axios.delete(`${baseUrl}/${id}`)

const update = (id, updatedPerson) => 
  axios.put(`${baseUrl}/${id}`, updatedPerson).then(response => response.data)

export default { getAll, create, remove, update }