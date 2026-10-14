'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@/components/shared/Icon'
import StackedLogo from '@/components/layout/logo/StackedLogo'
import { DEMO_ROLES, setDemoRole } from '@/lib/demo'
import { ROLE_HOME, ROLE_LABEL } from '@/lib/permissions'
import type { Role } from '@/types/auth'

const INFO: Record<Role, { icon: string; text: string }> = {
  super_admin: { icon: 'tabler:shield-star', text: 'Manage organisations, plans, payments, announcements and platform support.' },
  org_admin: { icon: 'tabler:building', text: 'Run one organisation: users, departments, support teams, billing and settings.' },
  support_manager: { icon: 'tabler:users-group', text: 'Oversee ticket queues, assignments, workloads and reports.' },
  technician: { icon: 'tabler:tool', text: 'Work assigned tickets, reply to requesters and add internal notes.' },
  employee: { icon: 'tabler:user', text: 'Raise internal IT support requests and track their progress.' },
  customer: { icon: 'tabler:headset', text: 'Submit and follow external support requests.' },
}

/** Demo-mode sign-in: pick a role to explore. No password, no account, sample data only. */
export default function DemoLogin() {
  const router = useRouter()
  return (
    <div className='min-h-screen w-full bg-lightprimary px-4 py-10'>
      <div className='mx-auto w-full max-w-4xl'>
        <div className='flex flex-col items-center text-center'>
          <Link href='/' aria-label='Qelvoro home'><StackedLogo className='h-24' /></Link>
          <h1 className='mt-5 text-2xl font-bold md:text-3xl'>Explore the Qelvoro demo</h1>
          <p className='mt-2 max-w-xl text-sm text-muted-foreground'>
            Choose a role to see its dashboard. Everything here is <strong>sample data</strong> and nothing you do is saved. You can switch roles at any time from the bar at the top.
          </p>
        </div>
        <ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {DEMO_ROLES.map((role) => (
            <li key={role}>
              <button type='button' onClick={() => { setDemoRole(role); router.replace(ROLE_HOME[role]) }}
                className='group flex h-full w-full flex-col rounded-2xl border border-border bg-background p-5 text-left shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 motion-safe:hover:-translate-y-1'>
                <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b57f5] to-[#00a2ff] text-white shadow-lg shadow-[#0b57f5]/25'>
                  <Icon icon={INFO[role].icon} width='22' aria-hidden='true' />
                </span>
                <span className='mt-4 text-base font-semibold'>{ROLE_LABEL[role]}</span>
                <span className='mt-1 flex-1 text-sm text-muted-foreground'>{INFO[role].text}</span>
                <span className='mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary'>
                  View as {ROLE_LABEL[role]} <Icon icon='tabler:arrow-right' width='16' aria-hidden='true' className='transition-transform group-hover:translate-x-1' />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
