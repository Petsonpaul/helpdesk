'use client'
import MetricsView from '@/components/dashboard/MetricsView'
import { DASHBOARD_ENDPOINT } from '@/services/report.service'

export default function Page() {
  return <MetricsView title='Platform dashboard' crumbs={[{ title: 'Home' }, { title: 'Platform' }]} endpoint={DASHBOARD_ENDPOINT.super_admin} ranges={[7, 30, 90]} />
}
