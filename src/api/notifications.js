import client from './client'

export const getNotifications = (page = 1) =>
  client.get('/notifications', { params: { page } }).then((r) => r.data)

export const markAsRead = (id) =>
  client.put(`/notifications/${id}/read`).then((r) => r.data)
