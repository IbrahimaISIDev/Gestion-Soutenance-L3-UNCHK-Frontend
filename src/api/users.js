import client from './client'

const BASE = '/admin/users'

export const getUsers = (page = 1, params = {}) =>
  client.get(BASE, { params: { page, ...params } }).then((r) => r.data)

export const getUser = (id) =>
  client.get(`${BASE}/${id}`).then((r) => r.data)

export const createUser = (data) =>
  client.post(BASE, data).then((r) => r.data)

export const updateUser = (id, data) =>
  client.put(`${BASE}/${id}`, data).then((r) => r.data)

export const deleteUser = (id) =>
  client.delete(`${BASE}/${id}`).then((r) => r.data)
