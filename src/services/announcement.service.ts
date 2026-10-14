import { api } from '@/lib/api-client'
export const PLATFORM_ANNOUNCEMENTS = '/platform-admin/announcements'
export const publishAnnouncement = (id: string | number) => api.post<void>(`${PLATFORM_ANNOUNCEMENTS}/${id}/publish`)
export const archiveAnnouncement = (id: string | number) => api.post<void>(`${PLATFORM_ANNOUNCEMENTS}/${id}/archive`)
export const markAnnouncementRead = (id: string | number) => api.post<void>(`/announcements/${id}/read`)
export const acknowledgeAnnouncement = (id: string | number) => api.post<void>(`/announcements/${id}/acknowledge`)
