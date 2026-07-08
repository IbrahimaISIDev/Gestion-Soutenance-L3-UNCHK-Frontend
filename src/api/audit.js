import client from './client'

export const getAuditLogs = (page = 1) =>
  client.get('/admin/audit', { params: { page } }).then((r) => r.data)

export const cleanAuditLogs = () =>
  client.delete('/admin/audit/clean').then((r) => r.data)
