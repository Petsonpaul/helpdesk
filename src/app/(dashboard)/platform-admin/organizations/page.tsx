'use client'
import ResourcePage from '@/components/shared/ResourcePage'
import { StatusPill } from '@/components/shared/Badges'
import { suspendOrganization, reactivateOrganization } from '@/services/organization.service'
import { formatDate } from '@/lib/formatters'

interface Org { id: number; name: string; status: string; plan: string | null; subscription_status: string | null; created_at: string; users_count: number }

export default function Page() {
  return (
    <ResourcePage<Org>
      title='Organisations'
      crumbs={[{ title: 'Home', to: '/platform-admin' }, { title: 'Organisations' }]}
      endpoint='/platform-admin/organizations'
      searchPlaceholder='Search organisations'
      filters={[
        { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }] },
        { key: 'subscription_status', label: 'Subscription', options: [{ value: 'trialing', label: 'Trial' }, { value: 'active', label: 'Paid' }, { value: 'expired', label: 'Expired' }] },
      ]}
      columns={[
        { key: 'name', header: 'Organisation', sortable: true },
        { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} /> },
        { key: 'plan', header: 'Plan' },
        { key: 'subscription_status', header: 'Subscription', render: (r) => (r.subscription_status ? <StatusPill value={r.subscription_status} /> : '—') },
        { key: 'users_count', header: 'Users' },
        { key: 'created_at', header: 'Created', sortable: true, render: (r) => formatDate(r.created_at) },
      ]}
      rowHref={(r) => `/platform-admin/organizations/${r.id}`}
      actions={[
        { label: 'Suspend', show: (r) => r.status === 'active', confirm: { title: 'Suspend organisation?', body: 'Its users will lose access until it is reactivated. Its data is kept.', confirmLabel: 'Suspend', destructive: true }, run: (r) => suspendOrganization(r.id) },
        { label: 'Reactivate', show: (r) => r.status === 'suspended', run: (r) => reactivateOrganization(r.id) },
      ]}
    />
  )
}
