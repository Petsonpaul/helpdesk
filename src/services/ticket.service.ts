import { api } from '@/lib/api-client'
import type { Option } from '@/types/api'
import type { TicketDetail, TicketStatus } from '@/types/ticket'

export interface TicketFormOptions { departments: Option[]; categories: Option[]; priorities: Option[]; can_set_priority: boolean; max_attachment_mb: number; allowed_extensions: string[] }

export const TICKETS = '/tickets'
export const getTicketFormOptions = async () => (await api.get<{ data: TicketFormOptions }>(`${TICKETS}/form-options`)).data
export const getTicket = async (id: string) => (await api.get<{ data: TicketDetail }>(`${TICKETS}/${encodeURIComponent(id)}`)).data
export const createTicket = (form: FormData) => api.post<{ data: { id: number | string } }>(TICKETS, form)
export const addReply = (id: string | number, form: FormData) => api.post<void>(`${TICKETS}/${id}/replies`, form)
export const addNote = (id: string | number, body: string) => api.post<void>(`${TICKETS}/${id}/notes`, { body })
export const changeStatus = (id: string | number, status: TicketStatus) => api.post<void>(`${TICKETS}/${id}/status`, { status })
export const assignTicket = (id: string | number, v: { team_id?: string; assignee_id?: string }) => api.post<void>(`${TICKETS}/${id}/assign`, v)
export const claimTicket = (id: string | number) => api.post<void>(`${TICKETS}/${id}/claim`)
export const acknowledgeTicket = (id: string | number) => api.post<void>(`${TICKETS}/${id}/acknowledge`)
export const escalateTicket = (id: string | number, reason: string) => api.post<void>(`${TICKETS}/${id}/escalate`, { reason })
