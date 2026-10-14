import type { Metadata } from 'next'
import FeatureCard from '@/components/marketing/FeatureCard'
import { PageHero, Section } from '@/components/marketing/Section'

export const metadata: Metadata = { title: 'Features - Qelvoro', description: 'What Qelvoro is designed to do.' }

const features = [
  { icon: 'tabler:ticket', title: 'Ticket management', text: 'Create, track and resolve support requests with clear statuses, priorities and a full conversation history.' },
  { icon: 'tabler:building', title: 'Department management', text: 'Model your organisation\'s units, such as Accounting, HR or Laboratory. Departments are stored in the database, not fixed in the code.' },
  { icon: 'tabler:users-group', title: 'Support-team management', text: 'Define the teams that resolve issues, such as Network or Hardware Support, separately from departments.' },
  { icon: 'tabler:user-check', title: 'Ticket assignment', text: 'Assign tickets to teams and technicians, with protection against two people claiming the same ticket.' },
  { icon: 'tabler:flag', title: 'Priority management', text: 'Low, Normal, High and Urgent priorities help teams decide what to work on first.' },
  { icon: 'tabler:bell', title: 'Notifications', text: 'In-app notifications keep requesters and support staff informed of assignments, replies and status changes.' },
  { icon: 'tabler:chart-line', title: 'Reporting and analytics', text: 'Role-appropriate charts and reports based on your organisation\'s real ticket data.' },
  { icon: 'tabler:settings', title: 'Organisation administration', text: 'Invite users, manage roles and memberships, and configure your workspace.' },
  { icon: 'tabler:credit-card', title: 'Subscription management', text: 'Start with a trial, then manage your plan and billing from your organisation settings.' },
  { icon: 'tabler:headset', title: 'External customer support', text: 'Optionally let your own customers submit and track requests. This is switched on per organisation.' },
]

export default function FeaturesPage() {
  return (
    <>
      <PageHero title='Features' subtitle='The capabilities Qelvoro is designed to provide. Qelvoro is under development, so availability may change before launch.' />
      <Section>
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {features.map((f) => <FeatureCard key={f.title} heading='h2' {...f} />)}
        </div>
      </Section>
    </>
  )
}
