'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ResourcePage from '@/components/shared/ResourcePage'
import { PriorityBadge, TicketStatusBadge } from '@/components/shared/Badges'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/formatters'
import { ROLE_HOME } from '@/lib/permissions'
import { PRIORITY_LABEL, STATUS_LABEL, type TicketSummary } from '@/types/ticket'

const opts = (m: Record<string, string>) => Object.entries(m).map(([value, label]) => ({ value, label }))

const STAFF_ROLES = ['org_admin', 'support_manager', 'technician']
const VIEWS: Record<string, Record<string, string>> = {
  unassigned: { assignee_id: 'unassigned' },
  mine: { assignee_id: 'me' },
  urgent: { priority: 'urgent' },
  escalated: { status: 'escalated' },
}

function TicketsList() {
  const { user } = useAuth()
  const view = useSearchParams().get('view') ?? ''
  const staff = !!user && STAFF_ROLES.includes(user.role)
  const canCreate = user?.role === 'employee' || user?.role === 'customer'
  return (
    <ResourcePage<TicketSummary>
      title='Tickets'
      crumbs={[{ title: 'Home', to: user ? ROLE_HOME[user.role] : '/' }, { title: 'Tickets' }]}
      key={view}
      initialFilters={VIEWS[view]}
      quickViews={staff ? [
        { label: 'All tickets', filters: {} },
        ...(user?.role === 'technician' ? [{ label: 'Assigned to me', filters: VIEWS.mine }] : []),
        { label: 'Unassigned', filters: VIEWS.unassigned },
        { label: 'Urgent', filters: VIEWS.urgent },
        { label: 'Escalated', filters: VIEWS.escalated },
      ] : undefined}
      endpoint='/tickets'
      searchPlaceholder='Search by reference or subject'
      headerActions={canCreate ? <Button asChild><Link href='/tickets/create'>Create ticket</Link></Button> : undefined}
      filters={[
        { key: 'status', label: 'Status', options: opts(STATUS_LABEL) },
        { key: 'priority', label: 'Priority', options: opts(PRIORITY_LABEL) },
        { key: 'department_id', label: 'Department', optionsEndpoint: '/options/departments' },
        { key: 'team_id', label: 'Team', optionsEndpoint: '/options/teams' },
        { key: 'assignee_id', label: 'Assignee', options: [{ value: 'me', label: 'Assigned to me' }, { value: 'unassigned', label: 'Unassigned' }], optionsEndpoint: '/options/users?role=technician' },
        { key: 'from', label: 'From', type: 'date' },
        { key: 'to', label: 'To', type: 'date' },
      ]}
      columns={[
        { key: 'reference', header: 'Ticket', sortable: true },
        { key: 'subject', header: 'Subject', render: (r) => <Link href={`/tickets/${r.id}`} className='font-medium hover:text-primary'>{r.subject}</Link> },
        { key: 'status', header: 'Status', render: (r) => <TicketStatusBadge status={r.status} /> },
        { key: 'priority', header: 'Priority', sortable: true, render: (r) => <PriorityBadge priority={r.priority} /> },
        { key: 'department', header: 'Department', render: (r) => r.department ?? '—' },
        { key: 'team', header: 'Team', render: (r) => r.team ?? '—' },
        { key: 'assignee', header: 'Assignee', render: (r) => r.assignee ?? 'Unassigned' },
        { key: 'updated_at', header: 'Updated', sortable: true, render: (r) => formatDate(r.updated_at, true) },
      ]}
      rowHref={(r) => `/tickets/${r.id}`}
      emptyTitle='No tickets found'
      emptyText='Try changing the filters or search.'
    />
  )
}

export default function Page() {
  return <Suspense><TicketsList /></Suspense>
}
