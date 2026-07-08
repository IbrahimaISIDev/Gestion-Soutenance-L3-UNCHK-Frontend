import client from './client'

export const getPvs = (page = 1) =>
  client.get('/responsable/pv', { params: { page } }).then((r) => r.data)

export const validatePv = (id) =>
  client.put(`/responsable/pv/${id}/validate`).then((r) => r.data)

export const rejectPv = (id, { commentaire }) =>
  client.put(`/responsable/pv/${id}/reject`, { commentaire }).then((r) => r.data)

export const exportFile = async (format) => {
  const response = await client.get(`/responsable/export/${format}`, { responseType: 'blob' })
  const url = URL.createObjectURL(response.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `soutenances.${format}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
