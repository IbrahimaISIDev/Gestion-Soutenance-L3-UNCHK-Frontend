import client from './client'

export const getIndisponibilites = () =>
  client.get('/enseignant/indisponibilites').then((r) => r.data)

export const createIndisponibilite = (data) =>
  client.post('/enseignant/indisponibilites', data).then((r) => r.data)

export const updateIndisponibilite = (id, data) =>
  client.put(`/enseignant/indisponibilites/${id}`, data).then((r) => r.data)

export const deleteIndisponibilite = (id) =>
  client.delete(`/enseignant/indisponibilites/${id}`).then((r) => r.data)
