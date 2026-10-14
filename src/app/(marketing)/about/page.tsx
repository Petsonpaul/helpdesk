import type { Metadata } from 'next'
import { PageHero, Section } from '@/components/marketing/Section'

export const metadata: Metadata = { title: 'About - Qelvoro' }

export default function AboutPage() {
  return (
    <>
      <PageHero title='About Qelvoro' subtitle='Why we are building it, and the problems it aims to solve.' />
      <Section>
        <div className='mx-auto max-w-3xl space-y-6 text-muted-foreground'>
          <p>Many organisations handle IT problems through scattered emails, chat messages and phone calls. Requests get lost, nobody is sure who owns an issue, and managers cannot see the workload.</p>
          <p>Qelvoro aims to give each organisation a single, private place to receive support requests, route them to the right team, follow them to resolution and learn from the results.</p>
          <p>We are focused on a few principles: clear ownership of every request, strict separation between organisations, and honest reporting based on real data.</p>
        </div>
      </Section>
    </>
  )
}
