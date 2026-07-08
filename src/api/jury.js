import client from './client'

// Enseignant
export const getMesJurys = () =>
  client.get('/enseignant/jury').then((r) => r.data)

export const confirmJury = (id) =>
  client.put(`/enseignant/jury/${id}/confirm`).then((r) => r.data)

export const declineJury = (id) =>
  client.put(`/enseignant/jury/${id}/decline`).then((r) => r.data)

// Responsable
export const validatePv = (pvId) =>
  client.put(`/responsable/pv/${pvId}/validate`).then((r) => r.data)

export const rejectPv = (pvId, commentaire) =>
  client.put(`/responsable/pv/${pvId}/reject`, { commentaire }).then((r) => r.data)
