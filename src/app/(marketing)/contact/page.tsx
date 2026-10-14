import type { Metadata } from 'next'
import { PageHero, Section } from '@/components/marketing/Section'
import ContactForm from '@/components/marketing/ContactForm'

export const metadata: Metadata = { title: 'Contact - Qelvoro' }

export default function ContactPage() {
  return (
    <>
      <PageHero title='Contact us' subtitle='Questions about Qelvoro? Send us a message.' />
      <Section><div className='mx-auto max-w-xl'><ContactForm /></div></Section>
    </>
  )
}
