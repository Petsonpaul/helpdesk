'use client'

import Link from 'next/link'
import { Icon } from '@/components/shared/Icon'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/use-subscription'
import { formatDate } from '@/lib/formatters'

/** Shown only to people who can manage billing. Everyone else never sees a purchase prompt. */
export default function SubscriptionBanner() {
  const { banner } = useSubscription()
  if (!banner) return null

  const urgent = banner.kind === 'payment_failed' || banner.urgent
  const label = banner.kind === 'trial' ? (urgent ? 'Trial ending soon' : 'Free trial') : 'Payment problem'
  return (
    <div role='status' className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-md border p-4 text-sm ${urgent ? 'border-warning bg-lightwarning' : 'border-border bg-lightprimary'}`}>
      <div className='flex min-w-0 items-start gap-3'>
        <Icon icon={urgent ? 'tabler:alert-triangle' : 'tabler:clock'} width='20' aria-hidden='true' className='mt-0.5 shrink-0' />
        <p className='break-words'>
          <strong>{label}: </strong>
          {banner.kind === 'trial'
            ? <>Your trial ends in {banner.text} (on {formatDate(banner.endsAt, true)}). Choose a plan to keep full access.</>
            : <>Your last payment did not go through. {banner.graceEndsAt ? <>Please update your payment by {formatDate(banner.graceEndsAt, true)} to avoid interruption.</> : <>Please update your payment to avoid interruption.</>}</>}
        </p>
      </div>
      <Button size='sm' asChild><Link href='/admin/billing'>{banner.kind === 'trial' ? 'Choose a plan' : 'Fix billing'}</Link></Button>
    </div>
  )
}
