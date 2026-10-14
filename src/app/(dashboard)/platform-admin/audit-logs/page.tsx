'use client'
import ResourcePage from '@/components/shared/ResourcePage'
import { formatDate } from '@/lib/formatters'

interface Log { id: number; actor: string; action: string; subject: string | null; ip_address: string | null; created_at: string }

export default function Page() {
  return (
    <ResourcePage<Log>
      title='Audit logs'
      crumbs={[{ title: 'Home', to: '/platform-admin' }, { title: 'Audit logs' }]}
      endpoint='/platform-admin/audit-logs'
      searchPlaceholder='Search actor or action'
      filters={[{ key: 'from', label: 'From', type: 'date' }, { key: 'to', label: 'To', type: 'date' }]}
      columns={[
        { key: 'created_at', header: 'When', render: (r) => formatDate(r.created_at, true) },
        { key: 'actor', header: 'Actor' },
        { key: 'action', header: 'Action' },
        { key: 'subject', header: 'Subject', render: (r) => r.subject ?? '—' },
        { key: 'ip_address', header: 'IP address', render: (r) => r.ip_address ?? '—' },
      ]}
    />
  )
}
