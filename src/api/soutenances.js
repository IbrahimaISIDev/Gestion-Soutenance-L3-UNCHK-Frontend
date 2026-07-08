import client from './client'

const BASE = '/secretaire/soutenances'

export const getSoutenances = (page = 1) =>
  client.get(BASE, { params: { page } }).then((r) => r.data)

export const getSoutenance = (id) =>
  client.get(`${BASE}/${id}`).then((r) => r.data)

export const createSoutenance = (data) =>
  client.post(BASE, data).then((r) => r.data)

export const updateSoutenance = (id, data) =>
  client.put(`${BASE}/${id}`, data).then((r) => r.data)

export const deleteSoutenance = (id) =>
  client.delete(`${BASE}/${id}`).then((r) => r.data)

export const confirmSoutenance = (id) =>
  client.put(`${BASE}/${id}/confirm`).then((r) => r.data)

export const cancelSoutenance = (id) =>
  client.put(`${BASE}/${id}/cancel`).then((r) => r.data)

// Jury
export const addJury = (soutenanceId, data) =>
  client.post(`${BASE}/${soutenanceId}/jury`, data).then((r) => r.data)

export const removeJury = (juryId) =>
  client.delete(`/secretaire/jury/${juryId}`).then((r) => r.data)

// PV
export const createPv = (soutenanceId, data) =>
  client.post(`${BASE}/${soutenanceId}/pv`, data).then((r) => r.data)

export const updatePv = (pvId, data) =>
  client.put(`/secretaire/pv/${pvId}`, data).then((r) => r.data)

export const submitPv = (pvId) =>
  client.put(`/secretaire/pv/${pvId}/submit`).then((r) => r.data)

// Étudiant
export const getMesSoutenances = () =>
  client.get('/etudiant/soutenances').then((r) => r.data)
