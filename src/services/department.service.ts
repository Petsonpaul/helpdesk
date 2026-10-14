import { api } from '@/lib/api-client'
export const DEPARTMENTS = '/departments'
export const setDepartmentActive = (id: string | number, is_active: boolean) => api.patch<void>(`${DEPARTMENTS}/${id}`, { is_active })
