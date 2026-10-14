import type { Metadata } from 'next'
import { DraftNotice, PageHero, Section } from '@/components/marketing/Section'

export const metadata: Metadata = { title: 'Terms of Service - Qelvoro' }

export default function Page() {
  return (
    <>
      <PageHero title='Terms of Service' subtitle='Draft document' />
      <Section>
        <div className='mx-auto max-w-3xl space-y-4 text-muted-foreground'>
          <DraftNotice>This is placeholder text for development. It is not a final legal document and has not been reviewed or approved.</DraftNotice>
          <h2 className='text-lg font-semibold text-foreground'>1. Using Qelvoro</h2>
          <p>[Draft] Terms describing acceptable use of the service will be added here.</p>
          <h2 className='text-lg font-semibold text-foreground'>2. Accounts and organisations</h2>
          <p>[Draft] Responsibilities of organisation owners and users will be added here.</p>
          <h2 className='text-lg font-semibold text-foreground'>3. Subscriptions and payments</h2>
          <p>[Draft] Trial, billing and cancellation terms will be added here once confirmed.</p>
        </div>
      </Section>
    </>
  )
}
