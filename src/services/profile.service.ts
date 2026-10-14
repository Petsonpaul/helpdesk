import { api } from '@/lib/api-client'
import type { NotificationPreferences, UserProfile } from '@/types/user'

export const getProfile = async () => (await api.get<{ data: UserProfile }>('/me/profile')).data
export const updateProfile = (v: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'phone' | 'job_title' | 'email'>>) => api.patch<void>('/me/profile', v)
export const uploadAvatar = (file: File) => { const f = new FormData(); f.append('avatar', file); return api.post<{ data: { avatar_url: string } }>('/me/avatar', f) }
export const changePassword = (v: { current_password: string; password: string; password_confirmation: string }) => api.post<void>('/me/password', v)
export const getNotificationPreferences = async () => (await api.get<{ data: NotificationPreferences }>('/me/notification-preferences')).data
export const saveNotificationPreferences = (v: NotificationPreferences) => api.put<void>('/me/notification-preferences', v)
