'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DraftNotice } from '@/components/marketing/Section'
import { getPlans } from '@/services/subscription.service'
import { formatPrice } from '@/lib/formatters'
import type { Plan } from '@/types/subscription'

export default function PlansGrid() {
  const [state, setState] = useState<{ plans: Plan[]; isDraft: boolean } | null>(null)
  useEffect(() => {
    let alive = true
    getPlans().then((r) => alive && setState(r))
    return () => { alive = false }
  }, [])

  if (!state) {
    return (
      <div className='grid gap-6 md:grid-cols-3' aria-busy='true'>
        {[0, 1, 2].map((i) => <Skeleton key={i} className='h-72 w-full' />)}
      </div>
    )
  }

  return (
    <>
      {state.isDraft && (
        <DraftNotice>
          These plans are development placeholders. Prices, limits and features are not confirmed and will be
          configured through the platform before launch.
        </DraftNotice>
      )}
      <div className='grid gap-6 md:grid-cols-3'>
        {state.plans.map((plan) => (
          <div key={plan.id} className='relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:shadow-xl motion-safe:hover:-translate-y-1'>
            <span aria-hidden='true' className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0b57f5] to-[#00a2ff]' />
            <h3 className='mt-1 text-lg font-semibold'>{plan.name}</h3>
            <p className='mt-1 text-sm text-muted-foreground'>{plan.description}</p>
            <p className='mt-5 text-xl font-bold'>{formatPrice(plan)}</p>
            {plan.trialDays ? <p className='text-xs text-muted-foreground'>{plan.trialDays}-day trial</p> : <p className='text-xs text-muted-foreground'>Trial availability to be confirmed</p>}
            <ul className='mt-5 flex flex-1 flex-col gap-2 text-sm'>
              {plan.features.map((f) => (
                <li key={f} className='flex items-start gap-2'>
                  <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0b57f5]/10 text-[#0b57f5]'><Icon icon='tabler:check' width='13' aria-hidden='true' /></span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button asChild className='mt-6 w-full'>
              <Link href='/register'>Get started</Link>
            </Button>
          </div>
        ))}
      </div>
    </>
  )
}
