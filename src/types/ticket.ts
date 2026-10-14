export type TicketStatus = 'new' | 'open' | 'in_progress' | 'pending_requester' | 'escalated' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export const STATUS_LABEL: Record<TicketStatus, string> = {
  new: 'New', open: 'Open', in_progress: 'In Progress', pending_requester: 'Pending Requester',
  escalated: 'Escalated', resolved: 'Resolved', closed: 'Closed',
}
export const PRIORITY_LABEL: Record<TicketPriority, string> = { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' }

export interface Attachment { id: string; name: string; size: number; download_url: string }
export interface TicketMessage { id: string; author: string; body: string; created_at: string; attachments?: Attachment[] }
export interface TicketNote { id: string; author: string; body: string; created_at: string }
export interface TicketHistoryEntry { id: string; text: string; created_at: string }

export interface TicketSummary {
  id: number | string
  reference: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  requester?: string
  department?: string | null
  team?: string | null
  assignee?: string | null
  created_at: string
  updated_at: string
  due_at?: string | null
}

/** The server decides what the caller may do; the UI only shows the buttons it is told about. */
export interface TicketPermissions {
  can_reply: boolean
  can_add_note: boolean
  can_assign: boolean
  can_claim: boolean
  can_acknowledge: boolean
  can_escalate: boolean
  can_change_status: boolean
}

export interface TicketDetail extends TicketSummary {
  description: string
  category?: string | null
  attachments: Attachment[]
  replies: TicketMessage[]
  /** present only when the caller is authorised support staff */
  notes?: TicketNote[]
  history: TicketHistoryEntry[]
  allowed_transitions: TicketStatus[]
  permissions: TicketPermissions
  team_id?: number | string | null
  assignee_id?: number | string | null
}
