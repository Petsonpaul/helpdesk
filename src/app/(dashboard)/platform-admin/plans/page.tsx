'use client'
import ResourcePage from '@/components/shared/ResourcePage'
import { StatusPill } from '@/components/shared/Badges'
import { formatMoney } from '@/lib/formatters'

interface PlanRow { id: number; name: string; price_monthly: number | null; currency: string | null; trial_days: number | null; agents_limit: number | null; tickets_limit: number | null; is_active: boolean; features_text?: string; description?: string }

export default function Page() {
  return (
    <ResourcePage<PlanRow>
      title='Plans'
      crumbs={[{ title: 'Home', to: '/platform-admin' }, { title: 'Plans' }]}
      endpoint='/platform-admin/plans'
      searchable={false}
      columns={[
        { key: 'name', header: 'Plan' },
        { key: 'price_monthly', header: 'Monthly price', render: (r) => formatMoney(r.price_monthly, r.currency) },
        { key: 'trial_days', header: 'Trial days' },
        { key: 'agents_limit', header: 'Agent limit', render: (r) => r.agents_limit ?? 'Not set' },
        { key: 'tickets_limit', header: 'Ticket limit', render: (r) => r.tickets_limit ?? 'Not set' },
        { key: 'is_active', header: 'Status', render: (r) => <StatusPill value={r.is_active ? 'active' : 'inactive'} /> },
      ]}
      form={{
        noun: 'plan',
        fields: [
          { name: 'name', label: 'Name', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'price_monthly', label: 'Monthly price', type: 'number', help: 'Leave empty until pricing is confirmed.' },
          { name: 'currency', label: 'Currency code (e.g. NGN, USD)' },
          { name: 'trial_days', label: 'Trial days', type: 'number' },
          { name: 'agents_limit', label: 'Agent limit', type: 'number', help: 'Leave empty for no limit configured.' },
          { name: 'tickets_limit', label: 'Ticket limit', type: 'number' },
          { name: 'features_text', label: 'Features (one per line)', type: 'textarea' },
          { name: 'is_active', label: 'Plan is available for purchase', type: 'checkbox' },
        ],
      }}
    />
  )
}
