import request from '@/utils/request'

export interface NotificationItem {
  id: number
  userId: number
  title: string
  content: string
  type: string
  relatedId?: number | null
  isRead: number
  createdAt?: string
}

export interface NotificationPageResult {
  total: number
  records: NotificationItem[]
}

export const getMyNotificationsApi = (params: { current?: number; size?: number }) =>
  request.get<NotificationPageResult>('/notifications', { params })

export const getUnreadNotificationCountApi = () =>
  request.get<{ count: number }>('/notifications/unread-count')

export const markNotificationReadApi = (id: number) =>
  request.post<void>(`/notifications/${id}/read`)

export const markAllNotificationsReadApi = () =>
  request.post<void>('/notifications/read-all')
