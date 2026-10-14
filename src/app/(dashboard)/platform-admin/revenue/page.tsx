'use client'
import MetricsView from '@/components/dashboard/MetricsView'

export default function Page() {
  return (
    <MetricsView
      title='Revenue'
      crumbs={[{ title: 'Home', to: '/platform-admin' }, { title: 'Revenue' }]}
      endpoint='/platform-admin/revenue'
      ranges={[30, 90, 365]}
      intro={<p className='mb-4 text-sm text-muted-foreground'>Gross payments, refunds and provider fees come from verified payment records. Net receipts are estimates until a settlement is confirmed.</p>}
    />
  )
}
