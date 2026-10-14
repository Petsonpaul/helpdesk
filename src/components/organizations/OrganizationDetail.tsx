'use client'

import { useState } from 'react'
import useSWR from 'swr'
import BreadcrumbComp from '@/components/layout/BreadcrumbComp'
import CardBox from '@/components/shared/CardBox'
import { Button } from '@/components/ui/button'
import ConfirmationDialog from '@/components/shared/ConfirmationDialog'
import { ErrorState, LoadingState } from '@/components/shared/StateViews'
import { StatusPill } from '@/components/shared/Badges'
import { getOrganizationDetail, reactivateOrganization, suspendOrganization } from '@/services/organization.service'
import { formatDate } from '@/lib/formatters'

const label = (k: string) => k.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
const isDate = (k: string) => k.endsWith('_at') || k.endsWith('_end')

/** Shows account and subscription metadata only. Private tickets are never shown to platform staff here. */
export default function OrganizationDetail({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useSWR(['org', id], () => getOrganizationDetail(id), { shouldRetryOnError: false })
  const [confirm, setConfirm] = useState<'suspend' | 'reactivate' | null>(null)

  return (
    <>
      <BreadcrumbComp title='Organisation' items={[{ title: 'Home', to: '/platform-admin' }, { title: 'Organisations', to: '/platform-admin/organizations' }, { title: 'Details' }]} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={(error as Error).message} onRetry={() => mutate()} />}
      {data && (
        <CardBox className='p-6'>
          <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
            <h2 className='text-lg font-semibold'>{String(data.name ?? 'Organisation')}</h2>
            {data.status === 'active' && <Button variant='outline' onClick={() => setConfirm('suspend')}>Suspend</Button>}
            {data.status === 'suspended' && <Button variant='outline' onClick={() => setConfirm('reactivate')}>Reactivate</Button>}
          </div>
          <dl className='grid gap-4 sm:grid-cols-2'>
            {Object.entries(data).filter(([k]) => k !== 'id' && k !== 'name').map(([k, v]) => (
              <div key={k}>
                <dt className='text-xs text-muted-foreground'>{label(k)}</dt>
                <dd className='text-sm font-medium'>
                  {k.endsWith('status') && typeof v === 'string' ? <StatusPill value={v} /> : isDate(k) && typeof v === 'string' ? formatDate(v, true) : String(v ?? '—')}
                </dd>
              </div>
            ))}
          </dl>
        </CardBox>
      )}
      <ConfirmationDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm === 'suspend' ? 'Suspend organisation?' : 'Reactivate organisation?'}
        body={confirm === 'suspend' ? 'Its users will lose access until it is reactivated. Its data is kept.' : 'Its users will regain access.'}
        confirmLabel={confirm === 'suspend' ? 'Suspend' : 'Reactivate'}
        destructive={confirm === 'suspend'}
        onConfirm={async () => { await (confirm === 'suspend' ? suspendOrganization(id) : reactivateOrganization(id)); await mutate() }}
      />
    </>
  )
}
