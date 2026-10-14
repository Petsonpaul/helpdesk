'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'
import BreadcrumbComp from '@/components/layout/BreadcrumbComp'
import CardBox from '@/components/shared/CardBox'
import { Button } from '@/components/ui/button'
import { ErrorState, LoadingState } from '@/components/shared/StateViews'
import { StatusPill } from '@/components/shared/Badges'
import { getBilling, startCheckout, verifyPayment } from '@/services/payment.service'
import { formatDate, formatMoney } from '@/lib/formatters'

const STATUS_TEXT: Record<string, string> = {
  trialing: 'You are on a free trial.',
  active: 'Your subscription is active.',
  past_due: 'Your last renewal payment failed. Please update your payment to avoid interruption.',
  grace: 'Your renewal payment failed. You are in a grace period.',
  expired: 'Your trial or subscription has expired. Your data is kept. Choose a plan to restore full access.',
  cancelled: 'Your subscription has been cancelled.',
  none: 'You do not have a subscription yet.',
}

export default function BillingPage() {
  const params = useSearchParams()
  const reference = params.get('reference') ?? params.get('trxref')
  const { data, error, isLoading, mutate } = useSWR('billing', getBilling, { shouldRetryOnError: false })
  const [busyPlan, setBusyPlan] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState('')
  const [verify, setVerify] = useState<'idle' | 'checking' | 'success' | 'failed' | 'pending'>('idle')
  const started = useRef(false)

  // After returning from the payment page, ask the SERVER whether the payment really succeeded.
  useEffect(() => {
    if (!reference || started.current) return
    started.current = true
    setVerify('checking')
    let tries = 0
    const tick = async () => {
      try {
        const s = await verifyPayment(reference)
        if (s === 'success') { setVerify('success'); mutate(); return }
        if (s === 'failed') { setVerify('failed'); return }
      } catch { /* keep trying a few times */ }
      if (++tries < 8) setTimeout(tick, 3000); else setVerify('pending')
    }
    tick()
  }, [reference, mutate])

  async function choose(planId: string) {
    if (busyPlan) return
    setBusyPlan(planId); setCheckoutError('')
    try {
      const { authorization_url } = await startCheckout(planId)
      if (!authorization_url.startsWith('https://')) throw new Error('Unexpected payment address received.')
      window.location.assign(authorization_url)
    } catch (e) { setCheckoutError(e instanceof Error ? e.message : 'Could not start checkout.'); setBusyPlan(null) }
  }

  return (
    <>
      <BreadcrumbComp title='Billing and subscription' items={[{ title: 'Home', to: '/admin' }, { title: 'Billing' }]} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={(error as Error).message} onRetry={() => mutate()} />}

      {verify === 'checking' && <p role='status' className='mb-4 rounded-md border border-border p-3 text-sm'>Confirming your payment with the payment provider...</p>}
      {verify === 'success' && <p role='status' className='mb-4 rounded-md bg-lightsuccess p-3 text-sm text-success'>Payment confirmed. Your subscription has been updated.</p>}
      {verify === 'failed' && <p role='alert' className='mb-4 rounded-md bg-lighterror p-3 text-sm text-error'>The payment was not successful. You have not been charged for a plan. Please try again.</p>}
      {verify === 'pending' && <p role='status' className='mb-4 rounded-md bg-lightwarning p-3 text-sm'>We have not received confirmation yet. This page will show your plan once the payment is verified; it is not shown as paid until then.</p>}

      {data && (
        <div className='space-y-6'>
          <CardBox className='p-6'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <p className='text-sm text-muted-foreground'>Current plan</p>
                <p className='text-xl font-bold'>{data.plan?.name ?? 'No plan'}</p>
              </div>
              <StatusPill value={data.status} />
            </div>
            <p className='mt-3 text-sm'>{STATUS_TEXT[data.status] ?? ''}</p>
            <dl className='mt-4 grid gap-3 text-sm sm:grid-cols-3'>
              {data.trial_ends_at && <div><dt className='text-xs text-muted-foreground'>Trial ends</dt><dd className='font-medium'>{formatDate(data.trial_ends_at, true)}</dd></div>}
              {data.current_period_end && <div><dt className='text-xs text-muted-foreground'>Current period ends</dt><dd className='font-medium'>{formatDate(data.current_period_end)}</dd></div>}
              {data.grace_ends_at && <div><dt className='text-xs text-muted-foreground'>Grace period ends</dt><dd className='font-medium'>{formatDate(data.grace_ends_at)}</dd></div>}
              {data.renewal_status && <div><dt className='text-xs text-muted-foreground'>Renewal</dt><dd className='font-medium'>{data.renewal_status}</dd></div>}
            </dl>
          </CardBox>

          <div>
            <h3 className='mb-3 text-base font-semibold'>Available plans</h3>
            {checkoutError && <p role='alert' className='mb-3 text-sm text-red-600'>{checkoutError}</p>}
            <div className='grid gap-4 md:grid-cols-3'>
              {data.plans.map((p) => (
                <CardBox key={p.id} className='flex flex-col p-5'>
                  <h4 className='font-semibold'>{p.name}</h4>
                  <p className='text-sm text-muted-foreground'>{p.description}</p>
                  <p className='mt-3 font-bold'>{p.price_monthly === null ? 'Pricing to be confirmed' : `${formatMoney(p.price_monthly, p.currency)} / month`}</p>
                  <ul className='mt-3 flex-1 list-disc space-y-1 ps-5 text-sm'>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                  <Button className='mt-4' disabled={busyPlan !== null || p.price_monthly === null} onClick={() => choose(p.id)}>
                    {data.plan?.id === p.id ? 'Renew / pay now' : busyPlan === p.id ? 'Redirecting...' : 'Choose plan'}
                  </Button>
                </CardBox>
              ))}
            </div>
          </div>

          <CardBox className='p-0'>
            <h3 className='p-5 text-base font-semibold'>Billing history</h3>
            {data.payments.length === 0 ? <p className='px-5 pb-5 text-sm text-muted-foreground'>No payments yet.</p> : (
              <div className='overflow-x-auto'>
                <table className='w-full min-w-[480px] text-sm'>
                  <thead><tr className='border-y border-border text-left'><th className='px-5 py-2'>Reference</th><th className='px-5 py-2'>Amount</th><th className='px-5 py-2'>Status</th><th className='px-5 py-2'>Date</th></tr></thead>
                  <tbody>
                    {data.payments.map((p) => (
                      <tr key={p.id} className='border-b border-border last:border-b-0'>
                        <td className='px-5 py-2'>{p.reference}</td><td className='px-5 py-2'>{formatMoney(p.amount, p.currency)}</td>
                        <td className='px-5 py-2'><StatusPill value={p.status} /></td><td className='px-5 py-2'>{formatDate(p.paid_at, true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBox>
        </div>
      )}
    </>
  )
}
