'use client'
import ResourcePage from '@/components/shared/ResourcePage'
import { StatusPill } from '@/components/shared/Badges'
import { formatDate, formatMoney } from '@/lib/formatters'

interface Settlement { id: number; reference: string; amount: number; currency: string; status: 'pending' | 'confirmed'; expected_date: string | null; confirmed_at: string | null }

export default function Page() {
  return (
    <ResourcePage<Settlement>
      title='Settlements'
      crumbs={[{ title: 'Home', to: '/platform-admin' }, { title: 'Settlements' }]}
      endpoint='/platform-admin/settlements'
      searchable={false}
      filters={[{ key: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' }] }]}
      emptyText='Settlements appear here only when the payment provider reports them.'
      columns={[
        { key: 'reference', header: 'Reference' },
        { key: 'amount', header: 'Amount', render: (r) => formatMoney(r.amount, r.currency) },
        { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} /> },
        { key: 'expected_date', header: 'Expected', render: (r) => formatDate(r.expected_date) },
        { key: 'confirmed_at', header: 'Confirmed', render: (r) => (r.status === 'confirmed' ? formatDate(r.confirmed_at) : 'Not confirmed') },
      ]}
    />
  )
}
