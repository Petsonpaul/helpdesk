import { api } from '@/lib/api-client'
import type { AuthUser } from '@/types/auth'

export async function getMe(): Promise<AuthUser> {
  const res = await api.get<{ data: AuthUser }>('/me')
  return res.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export const login = async (v: { email: string; password: string; remember: boolean }) =>
  (await api.post<{ data: AuthUser }>('/auth/login', v)).data
export const registerOrganization = (v: { name: string; email: string; organization_name: string; password: string; password_confirmation: string }) =>
  api.post<void>('/auth/register', v)
