import client from './client'

export const login = (credentials) =>
  client.post('/login', credentials).then((r) => r.data)

export const logout = () =>
  client.post('/logout').then((r) => r.data)

export const getMe = () =>
  client.get('/me').then((r) => r.data)
