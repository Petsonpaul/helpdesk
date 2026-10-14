'use client'
import ResourcePage from '@/components/shared/ResourcePage'
import { StatusPill } from '@/components/shared/Badges'
import { formatDate, formatMoney } from '@/lib/formatters'

interface Refund { id: number; payment_reference: string; organization: string; amount: number; currency: string; status: string; created_at: string }

export default function Page() {
  return (
    <ResourcePage<Refund>
      title='Refunds'
      crumbs={[{ title: 'Home', to: '/platform-admin' }, { title: 'Refunds' }]}
      endpoint='/platform-admin/refunds'
      searchable={false}
      columns={[
        { key: 'payment_reference', header: 'Payment' },
        { key: 'organization', header: 'Organisation' },
        { key: 'amount', header: 'Amount', render: (r) => formatMoney(r.amount, r.currency) },
        { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} /> },
        { key: 'created_at', header: 'Date', render: (r) => formatDate(r.created_at, true) },
      ]}
    />
  )
}
