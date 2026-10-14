'use client'
import MetricsView from '@/components/dashboard/MetricsView'
import { DASHBOARD_ENDPOINT } from '@/services/report.service'

export default function Page() {
  return <MetricsView title='Organisation dashboard' crumbs={[{ title: 'Home' }, { title: 'Organisation' }]} endpoint={DASHBOARD_ENDPOINT.org_admin} ranges={[7, 30, 90]} />
}
