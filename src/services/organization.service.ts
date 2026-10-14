import { api } from '@/lib/api-client'
import type { OrganizationSettings } from '@/types/organization'

export const getOrganizationSettings = async () => (await api.get<{ data: OrganizationSettings }>('/organization/settings')).data
export const updateOrganizationSettings = (v: Partial<OrganizationSettings>) => api.patch<void>('/organization/settings', v)
export const suspendOrganization = (id: string | number) => api.post<void>(`/platform-admin/organizations/${id}/suspend`)
export const reactivateOrganization = (id: string | number) => api.post<void>(`/platform-admin/organizations/${id}/reactivate`)
export const getOrganizationDetail = async (id: string) => (await api.get<{ data: Record<string, unknown> }>(`/platform-admin/organizations/${encodeURIComponent(id)}`)).data
export const setUserActive = (id: string | number, active: boolean) => api.post<void>(`/users/${id}/${active ? 'activate' : 'deactivate'}`)
