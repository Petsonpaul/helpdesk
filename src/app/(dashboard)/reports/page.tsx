'use client'
import MetricsView from '@/components/dashboard/MetricsView'
import { REPORTS_ENDPOINT } from '@/services/report.service'

export default function Page() {
  return (
    <MetricsView
      title='Reports'
      crumbs={[{ title: 'Home', to: '/dashboard' }, { title: 'Reports' }]}
      endpoint={REPORTS_ENDPOINT}
      ranges={[7, 30, 90, 365]}
      intro={<p className='mb-4 text-sm text-muted-foreground'>All figures are calculated by the server for the reports your role may see.</p>}
    />
  )
}
