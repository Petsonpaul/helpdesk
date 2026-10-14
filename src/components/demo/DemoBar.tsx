'use client'

import SelectField from '@/components/shared/SelectField'
import { useAuth } from '@/hooks/use-auth'
import { clearDemoRole, DEMO_MODE, DEMO_ROLES, setDemoRole } from '@/lib/demo'
import { ROLE_HOME, ROLE_LABEL } from '@/lib/permissions'
import type { Role } from '@/types/auth'

/** Shown only in demo mode: says the data is sample data and lets the viewer switch between all six dashboards. */
export default function DemoBar() {
  const { user } = useAuth()
  if (!DEMO_MODE || !user) return null
  return (
    <div role='region' aria-label='Demo mode' className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-[#0a47d6] px-4 py-2 text-xs text-white'>
      <p><strong>Demo mode</strong> · Sample data only. Changes are not saved and reset when the page reloads.</p>
      <div className='flex items-center gap-3'>
        <label htmlFor='demo-role' className='whitespace-nowrap'>View as</label>
        <div className='w-52 text-foreground'>
          <SelectField id='demo-role' value={user.role} className='h-8 rounded-lg text-xs'
            onChange={(r) => { setDemoRole(r as Role); window.location.assign(ROLE_HOME[r as Role]) }}
            options={DEMO_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} />
        </div>
        <button type='button' className='underline underline-offset-2' onClick={() => { clearDemoRole(); window.location.assign('/login') }}>Exit demo</button>
      </div>
    </div>
  )
}
