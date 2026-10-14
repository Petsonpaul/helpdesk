'use client'

import Link from 'next/link'
import MetricsView from './MetricsView'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ENDPOINT } from '@/services/report.service'
import { ROLE_LABEL } from '@/lib/permissions'
import type { Role } from '@/types/auth'

export default function RoleDashboard({ role, createTicket = false, ranges = [7, 30, 90] }: { role: Role; createTicket?: boolean; ranges?: number[] | undefined }) {
  return (
    <MetricsView
      title={`${ROLE_LABEL[role]} dashboard`}
      crumbs={[{ title: 'Home' }, { title: 'Dashboard' }]}
      endpoint={DASHBOARD_ENDPOINT[role as keyof typeof DASHBOARD_ENDPOINT]}
      ranges={ranges}
      headerActions={createTicket ? <Button size='lg' asChild><Link href='/tickets/create'>{role === 'customer' ? 'Create support request' : 'Create ticket'}</Link></Button> : undefined}
    />
  )
}
