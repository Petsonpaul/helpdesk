'use client'

import { Icon } from '@/components/shared/Icon'
import CardBox from '@/components/shared/CardBox'

/** Shown to customers when their organisation has switched the customer portal off. Laravel enforces this too. */
export default function PortalDisabled({ organizationName }: { organizationName?: string }) {
  return (
    <CardBox className='mx-auto max-w-xl p-8 text-center'>
      <div role='alert'>
        <Icon icon='tabler:headset-off' width='40' aria-hidden='true' className='mx-auto text-primary' />
        <h2 className='mt-3 text-xl font-semibold'>Customer support is not available right now</h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          {organizationName ? `${organizationName} has` : 'This organisation has'} turned off online customer support requests. Please contact them directly if you need help. Your profile and settings are still available.
        </p>
      </div>
    </CardBox>
  )
}
