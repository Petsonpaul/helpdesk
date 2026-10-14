import { Icon } from '@/components/shared/Icon'
import { Badge } from '@/components/ui/badge'
import { PRIORITY_LABEL, STATUS_LABEL, type TicketPriority, type TicketStatus } from '@/types/ticket'

// Each badge has an icon AND a text label, so meaning never relies on colour alone.
const STATUS_STYLE: Record<TicketStatus, { variant: 'lightInfo' | 'lightPrimary' | 'lightWarning' | 'lightError' | 'lightSuccess' | 'gray'; icon: string }> = {
  new: { variant: 'lightInfo', icon: 'tabler:sparkles' },
  open: { variant: 'lightPrimary', icon: 'tabler:circle-dot' },
  in_progress: { variant: 'lightPrimary', icon: 'tabler:progress' },
  pending_requester: { variant: 'lightWarning', icon: 'tabler:hourglass' },
  escalated: { variant: 'lightError', icon: 'tabler:arrow-up-circle' },
  resolved: { variant: 'lightSuccess', icon: 'tabler:circle-check' },
  closed: { variant: 'gray', icon: 'tabler:lock' },
}
const PRIORITY_STYLE: Record<TicketPriority, { variant: 'gray' | 'lightInfo' | 'lightWarning' | 'lightError'; icon: string }> = {
  low: { variant: 'gray', icon: 'tabler:arrow-down' },
  normal: { variant: 'lightInfo', icon: 'tabler:minus' },
  high: { variant: 'lightWarning', icon: 'tabler:arrow-up' },
  urgent: { variant: 'lightError', icon: 'tabler:alert-triangle' },
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.open
  return <Badge variant={s.variant} className='gap-1 whitespace-nowrap'><Icon icon={s.icon} width='14' aria-hidden='true' />{STATUS_LABEL[status] ?? status}</Badge>
}
export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const s = PRIORITY_STYLE[priority] ?? PRIORITY_STYLE.normal
  return <Badge variant={s.variant} className='gap-1 whitespace-nowrap'><Icon icon={s.icon} width='14' aria-hidden='true' />{PRIORITY_LABEL[priority] ?? priority}</Badge>
}

/** Generic status pill for non-ticket records (active/suspended/paid...). Text always shown. */
export function StatusPill({ value }: { value: string }) {
  const good = ['active', 'paid', 'success', 'successful', 'published', 'confirmed', 'resolved', 'answered']
  const bad = ['suspended', 'failed', 'expired', 'cancelled', 'refunded', 'inactive', 'archived', 'closed']
  const variant = good.includes(value) ? 'lightSuccess' : bad.includes(value) ? 'lightError' : 'lightWarning'
  return <Badge variant={variant} className='whitespace-nowrap capitalize'>{value.replace(/_/g, ' ')}</Badge>
}
