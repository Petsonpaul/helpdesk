'use client'
import ResourcePage from '@/components/shared/ResourcePage'
import { StatusPill } from '@/components/shared/Badges'
import { formatDate } from '@/lib/formatters'

interface Sub { id: number; organization: string; plan: string | null; status: string; trial_ends_at: string | null; current_period_end: string | null; renewal_status: string | null }

export default function Page() {
  return (
    <ResourcePage<Sub>
      title='Subscriptions'
      crumbs={[{ title: 'Home', to: '/platform-admin' }, { title: 'Subscriptions' }]}
      endpoint='/platform-admin/subscriptions'
      filters={[{ key: 'status', label: 'Status', options: [{ value: 'trialing', label: 'Trial' }, { value: 'active', label: 'Active' }, { value: 'past_due', label: 'Past due' }, { value: 'expired', label: 'Expired' }, { value: 'cancelled', label: 'Cancelled' }] }]}
      columns={[
        { key: 'organization', header: 'Organisation' },
        { key: 'plan', header: 'Plan' },
        { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} /> },
        { key: 'trial_ends_at', header: 'Trial ends', render: (r) => formatDate(r.trial_ends_at) },
        { key: 'current_period_end', header: 'Period end', render: (r) => formatDate(r.current_period_end) },
        { key: 'renewal_status', header: 'Renewal', render: (r) => r.renewal_status ?? '—' },
      ]}
    />
  )
}
