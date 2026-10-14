'use client'
import ResourcePage from '@/components/shared/ResourcePage'
import { StatusPill } from '@/components/shared/Badges'
import { refundPayment } from '@/services/payment.service'
import { formatDate, formatMoney } from '@/lib/formatters'

interface Pay { id: number; reference: string; organization: string; amount: number; currency: string; provider_fee: number | null; status: string; paid_at: string | null; can_refund: boolean }

export default function Page() {
  return (
    <ResourcePage<Pay>
      title='Payments'
      crumbs={[{ title: 'Home', to: '/platform-admin' }, { title: 'Payments' }]}
      endpoint='/platform-admin/payments'
      searchPlaceholder='Search by reference or organisation'
      filters={[{ key: 'status', label: 'Status', options: [{ value: 'success', label: 'Successful' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }] }]}
      columns={[
        { key: 'reference', header: 'Reference' },
        { key: 'organization', header: 'Organisation' },
        { key: 'amount', header: 'Amount', render: (r) => formatMoney(r.amount, r.currency) },
        { key: 'provider_fee', header: 'Provider fee', render: (r) => (r.provider_fee === null ? 'Not available' : formatMoney(r.provider_fee, r.currency)) },
        { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} /> },
        { key: 'paid_at', header: 'Paid', render: (r) => formatDate(r.paid_at, true) },
      ]}
      actions={[{ label: 'Refund', show: (r) => r.can_refund, confirm: { title: 'Refund this payment?', body: 'The refund is sent to the payment provider and recorded in the audit log. This cannot be undone.', confirmLabel: 'Refund', destructive: true }, run: (r) => refundPayment(r.id) }]}
    />
  )
}
