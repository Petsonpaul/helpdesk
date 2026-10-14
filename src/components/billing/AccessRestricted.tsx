'use client'

import Link from 'next/link'
import { Icon } from '@/components/shared/Icon'
import CardBox from '@/components/shared/CardBox'
import { Button } from '@/components/ui/button'
import type { SubscriptionState } from '@/types/auth'

/** Replaces paid pages when the server says access is restricted. Data is preserved; billing stays reachable. */
export default function AccessRestricted({ sub }: { sub: SubscriptionState }) {
  const manager = sub.can_manage_billing
  const what = sub.status === 'cancelled' ? 'has been cancelled' : 'has expired'
  return (
    <CardBox className='mx-auto max-w-xl p-8 text-center'>
      <div role='alert'>
        <Icon icon='tabler:lock' width='40' aria-hidden='true' className='mx-auto text-primary' />
        <h2 className='mt-3 text-xl font-semibold'>Access is restricted</h2>
        {manager ? (
          <>
            <p className='mt-2 text-sm text-muted-foreground'>
              Your organisation&apos;s trial or subscription {what}, so this feature is paused. Your tickets and data are safe and have not been deleted. Choose a plan to restore full access.
            </p>
            <div className='mt-5 flex flex-wrap justify-center gap-3'>
              <Button asChild><Link href='/admin/billing'>Go to billing</Link></Button>
              <Button variant='outline' asChild><Link href='/admin/platform-support'>Contact Qelvoro</Link></Button>
            </div>
          </>
        ) : (
          <p className='mt-2 text-sm text-muted-foreground'>
            Your organisation&apos;s subscription needs attention, so this feature is paused for now. Your tickets and data are safe. Please let your organisation&apos;s administrator know.
          </p>
        )}
      </div>
    </CardBox>
  )
}
