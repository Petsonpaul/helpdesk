import type { Metadata } from 'next'
import { DraftNotice, PageHero, Section } from '@/components/marketing/Section'

export const metadata: Metadata = { title: 'Privacy Policy - Qelvoro' }

export default function Page() {
  return (
    <>
      <PageHero title='Privacy Policy' subtitle='Draft document' />
      <Section>
        <div className='mx-auto max-w-3xl space-y-4 text-muted-foreground'>
          <DraftNotice>This is placeholder text for development. It is not a final legal document and has not been reviewed or approved.</DraftNotice>
          <h2 className='text-lg font-semibold text-foreground'>1. Information we collect</h2>
          <p>[Draft] A description of the personal information the service collects will be added here.</p>
          <h2 className='text-lg font-semibold text-foreground'>2. How information is used</h2>
          <p>[Draft] Purposes of processing will be added here.</p>
          <h2 className='text-lg font-semibold text-foreground'>3. Your choices</h2>
          <p>[Draft] Access, correction and deletion options will be added here after legal review.</p>
        </div>
      </Section>
    </>
  )
}
