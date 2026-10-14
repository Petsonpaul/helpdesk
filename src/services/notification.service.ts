import { api } from '@/lib/api-client'
import type { Paginated } from '@/types/api'
import type { AppNotification, NotificationFilter } from '@/types/notification'

export const listNotifications = (filter: NotificationFilter, page = 1, perPage = 10) =>
  api.get<Paginated<AppNotification>>('/notifications', { filter, page, per_page: perPage })

export const getUnreadCount = async () => (await api.get<{ count: number }>('/notifications/unread-count')).count
export const markNotificationRead = (id: string) => api.post<void>(`/notifications/${encodeURIComponent(id)}/read`)
export const markAllNotificationsRead = () => api.post<void>('/notifications/read-all')
