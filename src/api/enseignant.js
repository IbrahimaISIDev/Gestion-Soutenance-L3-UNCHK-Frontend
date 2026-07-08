import client from './client'

export const getMesSoutenances = () =>
  client.get('/enseignant/soutenances').then((r) => r.data)
