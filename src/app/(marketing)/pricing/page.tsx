import type { Metadata } from 'next'
import { PageHero, Section } from '@/components/marketing/Section'
import PlansGrid from '@/components/marketing/PlansGrid'

export const metadata: Metadata = { title: 'Pricing - Qelvoro', description: 'Qelvoro plans.' }

export default function PricingPage() {
  return (
    <>
      <PageHero title='Pricing' subtitle='Plans are configured on the platform. Details shown here always come from the same source.' />
      <Section><PlansGrid /></Section>
    </>
  )
}
