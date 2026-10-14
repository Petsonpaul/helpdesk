import Link from 'next/link'
import type { Metadata } from 'next'
import { Icon } from '@/components/shared/Icon'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Section, SectionHeading } from '@/components/marketing/Section'
import PlansGrid from '@/components/marketing/PlansGrid'
import FeatureCard from '@/components/marketing/FeatureCard'
import HeroVisual from '@/components/marketing/HeroVisual'
import { DotGrid, GlowBlobs, WaveDivider } from '@/components/marketing/Decor'
import BrandMark from '@/components/layout/logo/BrandMark'
import { SITE } from '@/lib/route-config'

export const metadata: Metadata = { title: `${SITE.name} - ${SITE.tagline}`, description: SITE.description }

const benefits = [
  { icon: 'tabler:inbox', title: 'One place for every request', text: 'Bring support requests together instead of scattering them across email and chat.' },
  { icon: 'tabler:users-group', title: 'Organised support teams', text: 'Keep departments and the teams that resolve issues as separate, clearly managed groups.' },
  { icon: 'tabler:chart-bar', title: 'Visibility into operations', text: 'Reports are designed to show workload, backlog and resolution trends from real ticket data.' },
  { icon: 'tabler:shield-lock', title: 'Private by design', text: 'Each organisation gets its own workspace, with tenant separation enforced on the server.' },
]

const steps = [
  { n: '1', title: 'Set up your workspace', text: 'Create your organisation, add departments and support teams, and invite your people.' },
  { n: '2', title: 'Collect requests', text: 'Staff raise tickets; optionally, your customers can too.' },
  { n: '3', title: 'Assign and resolve', text: 'Route tickets to the right team, track status and keep the conversation in one thread.' },
  { n: '4', title: 'Review and improve', text: 'Use reports to understand workload and where support can improve.' },
]

const useCases = ['Schools and universities', 'Hospitals and laboratories', 'Pharmacies', 'Manufacturing companies', 'Retail businesses', 'Financial organisations', 'Technology companies', 'Small and growing businesses']

const capabilities = [
  { icon: 'tabler:ticket', label: 'Ticket management' }, { icon: 'tabler:building-community', label: 'Departments and support teams' },
  { icon: 'tabler:user-check', label: 'Ticket assignment' }, { icon: 'tabler:flag', label: 'Priority levels' },
  { icon: 'tabler:bell', label: 'Notifications' }, { icon: 'tabler:chart-line', label: 'Reports and analytics' },
  { icon: 'tabler:settings', label: 'Organisation administration' }, { icon: 'tabler:credit-card', label: 'Subscription management' },
]

const highlights = [
  { icon: 'tabler:ticket', label: 'Tickets and assignment' },
  { icon: 'tabler:users-group', label: 'Teams and departments' },
  { icon: 'tabler:chart-bar', label: 'Reports' },
]

const faqs = [
  { q: 'Is Qelvoro available now?', a: 'Qelvoro is under active development. What you see here describes the product design, and details may change before launch.' },
  { q: 'Is my organisation\'s data separated from others?', a: 'Yes, that is a core design requirement: each organisation has a private workspace and access is checked on the server for every request.' },
  { q: 'What is the difference between a department and a support team?', a: 'A department is where a requester belongs (for example Accounting). A support team is who resolves the issue (for example Network Support).' },
  { q: 'Can my customers use it too?', a: 'An optional external customer portal is planned and can be switched on per organisation.' },
  { q: 'How much does it cost?', a: 'Pricing has not been confirmed yet. See the pricing page for the current plan outline.' },
]

export default function HomePage() {
  const dot = SITE.tagline.indexOf('. ') + 1
  const first = SITE.tagline.slice(0, dot)
  const second = SITE.tagline.slice(dot + 1).trim()

  return (
    <>
      {/* Hero */}
      <section className='relative overflow-hidden bg-lightprimary'>
        <GlowBlobs />
        <DotGrid />
        <div className='container relative mx-auto grid items-center gap-14 px-6 pb-28 pt-14 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:pb-32'>
          <div>
            <span className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur'>
              <BrandMark className='h-4' decorative />
              Helpdesk and IT support platform
            </span>
            <h1 className='mt-6 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl'>
              {first}{' '}
              <span className='bg-gradient-to-r from-[#0b57f5] to-[#00a2ff] bg-clip-text text-transparent'>{second}</span>
            </h1>
            <p className='mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground'>
              Qelvoro helps organisations centralise support requests, manage IT teams, track issues and improve support operations.
            </p>
            <div className='mt-8 flex flex-wrap gap-3'>
              <Button size='lg' asChild className='shadow-lg shadow-[#0b57f5]/25'><Link href='/register'>Start free trial</Link></Button>
              <Button size='lg' variant='outline' asChild className='bg-background/60 backdrop-blur'><Link href='/features'>Explore features</Link></Button>
            </div>
            <ul className='mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground'>
              {highlights.map((h) => (
                <li key={h.label} className='flex items-center gap-2'>
                  <span className='flex h-7 w-7 items-center justify-center rounded-lg bg-background text-primary shadow-sm'><Icon icon={h.icon} width='16' aria-hidden='true' /></span>
                  {h.label}
                </li>
              ))}
            </ul>
          </div>
          <HeroVisual />
        </div>
        <WaveDivider className='absolute bottom-0 left-0' />
      </section>

      <Section>
        <SectionHeading title='Why teams choose Qelvoro' subtitle='Built around how IT support actually works inside an organisation.' />
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {benefits.map((b) => <FeatureCard key={b.title} {...b} />)}
        </div>
      </Section>

      <Section tinted className='relative overflow-hidden'>
        <DotGrid />
        <div className='relative'>
          <SectionHeading title='How it works' subtitle='From first request to finished fix in four steps.' />
          <ol className='relative grid gap-6 md:grid-cols-4'>
            <div aria-hidden='true' className='absolute left-[12%] right-[12%] top-[2.875rem] hidden border-t-2 border-dashed border-primary/30 md:block' />
            {steps.map((s) => (
              <li key={s.n} className='relative'>
                <div className='h-full rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:shadow-xl motion-safe:hover:-translate-y-1'>
                  <span className='flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0b57f5] to-[#00a2ff] text-sm font-bold text-white shadow-lg shadow-[#0b57f5]/25 ring-4 ring-background'>{s.n}</span>
                  <h3 className='mt-4 font-semibold'>{s.title}</h3>
                  <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section>
        <SectionHeading title='Made for many kinds of organisation' />
        <ul className='mx-auto flex max-w-3xl flex-wrap justify-center gap-3'>
          {useCases.map((u) => (
            <li key={u} className='flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm shadow-sm transition-shadow hover:shadow-md'>
              <span aria-hidden='true' className='h-2 w-2 rounded-full bg-gradient-to-br from-[#0b57f5] to-[#00a2ff]' />{u}
            </li>
          ))}
        </ul>
      </Section>

      <Section tinted>
        <SectionHeading title='Product capabilities' subtitle='The areas Qelvoro is designed to cover.' />
        <ul className='mx-auto grid max-w-4xl gap-4 sm:grid-cols-2'>
          {capabilities.map((c) => (
            <li key={c.label} className='flex items-center gap-4 rounded-2xl border border-border bg-background p-4 shadow-sm transition-all duration-300 hover:shadow-lg motion-safe:hover:-translate-y-0.5'>
              <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b57f5] to-[#00a2ff] text-white shadow-md shadow-[#0b57f5]/20'><Icon icon={c.icon} width='20' aria-hidden='true' /></span>
              <span className='text-sm font-medium'>{c.label}</span>
            </li>
          ))}
        </ul>
        <div className='mt-8 text-center'><Button variant='outline' asChild className='bg-background'><Link href='/features'>See all features</Link></Button></div>
      </Section>

      <Section>
        <SectionHeading title='Plans' subtitle='A preview of the plan outline.' />
        <PlansGrid />
        <div className='mt-8 text-center'><Button variant='outline' asChild><Link href='/pricing'>Compare plans</Link></Button></div>
      </Section>

      <Section tinted>
        <SectionHeading title='Frequently asked questions' />
        <Accordion type='single' collapsible className='mx-auto max-w-3xl space-y-3'>
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`f${i}`} className='rounded-2xl border border-border bg-background px-5 shadow-sm data-[state=open]:shadow-md'>
              <AccordionTrigger className='text-left hover:no-underline'>{f.q}</AccordionTrigger>
              <AccordionContent className='text-muted-foreground'>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      <section className='container mx-auto px-6 py-16 md:py-20'>
        <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b57f5] via-[#0a47d6] to-[#06238f] px-6 py-14 text-center text-white shadow-2xl shadow-[#0b57f5]/25 md:px-12'>
          <svg aria-hidden='true' className='pointer-events-none absolute inset-0 h-full w-full text-white/10' viewBox='0 0 800 300' preserveAspectRatio='xMidYMid slice'>
            <circle cx='90' cy='60' r='140' fill='none' stroke='currentColor' strokeWidth='2' />
            <circle cx='90' cy='60' r='90' fill='none' stroke='currentColor' strokeWidth='2' />
            <circle cx='720' cy='260' r='160' fill='none' stroke='currentColor' strokeWidth='2' />
            <circle cx='720' cy='260' r='100' fill='none' stroke='currentColor' strokeWidth='2' />
          </svg>
          <div className='relative mx-auto max-w-2xl'>
            <h2 className='text-2xl font-bold md:text-3xl'>Ready to organise your IT support?</h2>
            <p className='mt-3 text-white/80'>Create your organisation and see how Qelvoro fits your team.</p>
            <div className='mt-7 flex flex-wrap justify-center gap-3'>
              <Button size='lg' asChild className='bg-white text-[#0a47d6] hover:bg-white/90'><Link href='/register'>Start free trial</Link></Button>
              <Button size='lg' variant='outline' asChild className='border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white'><Link href='/contact'>Talk to us</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
