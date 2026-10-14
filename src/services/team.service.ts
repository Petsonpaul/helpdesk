import { api } from '@/lib/api-client'
export interface TeamMember { id: number | string; name: string; email: string }
export const TEAMS = '/teams'
export const setTeamActive = (id: string | number, is_active: boolean) => api.patch<void>(`${TEAMS}/${id}`, { is_active })
export const listTeamMembers = async (id: string | number) => (await api.get<{ data: TeamMember[] }>(`${TEAMS}/${id}/members`)).data
export const addTeamMember = (id: string | number, user_id: string | number) => api.post<void>(`${TEAMS}/${id}/members`, { user_id })
export const removeTeamMember = (id: string | number, user_id: string | number) => api.delete<void>(`${TEAMS}/${id}/members/${user_id}`)
