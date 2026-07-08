import client from './client'

export const getSalles = (page = 1) =>
  client.get('/admin/salles', { params: { page } }).then((r) => r.data)

export const getSalle = (id) =>
  client.get(`/admin/salles/${id}`).then((r) => r.data)

export const createSalle = (data) =>
  client.post('/admin/salles', data).then((r) => r.data)

export const updateSalle = (id, data) =>
  client.put(`/admin/salles/${id}`, data).then((r) => r.data)

export const deleteSalle = (id) =>
  client.delete(`/admin/salles/${id}`).then((r) => r.data)
