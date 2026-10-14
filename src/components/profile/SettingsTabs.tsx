'use client'

import { FormEvent, useEffect, useState } from 'react'
import useSWR from 'swr'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import BreadcrumbComp from '@/components/layout/BreadcrumbComp'
import CardBox from '@/components/shared/CardBox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ErrorState, LoadingState } from '@/components/shared/StateViews'
import { FormField } from '@/components/shared/FormField'
import SelectField from '@/components/shared/SelectField'
import { ApiError } from '@/lib/api-client'
import { changePassword, getNotificationPreferences, saveNotificationPreferences } from '@/services/profile.service'
import type { NotificationPreferences } from '@/types/user'

const TABS = [{ id: 'security', label: 'Security' }, { id: 'notifications', label: 'Notifications' }, { id: 'appearance', label: 'Appearance' }] as const
const CATEGORIES = [{ id: 'tickets', label: 'Tickets' }, { id: 'billing', label: 'Billing and subscription' }, { id: 'announcements', label: 'Announcements' }, { id: 'platform_support', label: 'Platform support' }]

function Msg({ m }: { m: { ok: boolean; text: string } | null }) {
  return m ? <p role={m.ok ? 'status' : 'alert'} className={`text-sm ${m.ok ? 'text-green-600' : 'text-red-600'}`}>{m.text}</p> : null
}

function PasswordForm() {
  const [v, setV] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    const found: Record<string, string> = {}
    if (!v.current_password) found.current_password = 'Enter your current password.'
    if (v.password.length < 8) found.password = 'Password must be at least 8 characters.'
    if (v.password !== v.password_confirmation) found.password_confirmation = 'Passwords do not match.'
    setErrors(found); setMsg(null)
    if (Object.keys(found).length) return
    setBusy(true)
    try { await changePassword(v); setV({ current_password: '', password: '', password_confirmation: '' }); setMsg({ ok: true, text: 'Password changed.' }) }
    catch (err) {
      if (err instanceof ApiError) setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, m]) => [k, m[0]])))
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Could not change password.' })
    } finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} noValidate className='flex max-w-md flex-col gap-4'>
      <FormField id='pw-cur' label='Current password' error={errors.current_password}><Input id='pw-cur' type='password' autoComplete='current-password' value={v.current_password} onChange={set('current_password')} /></FormField>
      <FormField id='pw-new' label='New password' error={errors.password}><Input id='pw-new' type='password' autoComplete='new-password' value={v.password} onChange={set('password')} /></FormField>
      <FormField id='pw-conf' label='Confirm new password' error={errors.password_confirmation}><Input id='pw-conf' type='password' autoComplete='new-password' value={v.password_confirmation} onChange={set('password_confirmation')} /></FormField>
      <Msg m={msg} />
      <div><Button type='submit' disabled={busy}>{busy ? 'Saving...' : 'Change password'}</Button></div>
    </form>
  )
}

function NotificationForm() {
  const { data, error, isLoading, mutate } = useSWR('notification-prefs', getNotificationPreferences, { shouldRetryOnError: false })
  const [p, setP] = useState<NotificationPreferences | null>(null)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (data) setP(data) }, [data])

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!p || busy) return
    setBusy(true); setMsg(null)
    try { await saveNotificationPreferences(p); await mutate(); setMsg({ ok: true, text: 'Preferences saved.' }) }
    catch (err) { setMsg({ ok: false, text: err instanceof Error ? err.message : 'Could not save.' }) }
    finally { setBusy(false) }
  }
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => mutate()} />
  if (!p) return null
  const toggle = (k: 'in_app' | 'email' | 'sound') => (e: { target: { checked: boolean } }) => setP({ ...p, [k]: e.target.checked })
  return (
    <form onSubmit={save} className='flex max-w-md flex-col gap-4'>
      <label className='flex items-center gap-2 text-sm'><input type='checkbox' className='h-4 w-4' checked={p.in_app} onChange={toggle('in_app')} /> In-app notifications</label>
      <label className='flex items-center gap-2 text-sm'><input type='checkbox' className='h-4 w-4' checked={p.email} onChange={toggle('email')} /> Email notifications</label>
      <div>
        <label className='flex items-center gap-2 text-sm'><input type='checkbox' className='h-4 w-4' checked={p.sound} onChange={toggle('sound')} /> Sound alerts</label>
        <p className='mt-1 text-xs text-muted-foreground'>Sounds only play while Qelvoro is open in your browser, and your browser may block them until you interact with the page.</p>
      </div>
      <fieldset>
        <legend className='mb-2 text-sm font-medium'>Categories</legend>
        {CATEGORIES.map((c) => (
          <label key={c.id} className='mb-1 flex items-center gap-2 text-sm'>
            <input type='checkbox' className='h-4 w-4' checked={p.categories.includes(c.id)}
              onChange={(e) => setP({ ...p, categories: e.target.checked ? [...p.categories, c.id] : p.categories.filter((x) => x !== c.id) })} /> {c.label}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend className='mb-2 text-sm font-medium'>Quiet hours (non-urgent alerts)</legend>
        <label className='mb-2 flex items-center gap-2 text-sm'><input type='checkbox' className='h-4 w-4' checked={p.quiet_hours.enabled} onChange={(e) => setP({ ...p, quiet_hours: { ...p.quiet_hours, enabled: e.target.checked } })} /> Enable quiet hours</label>
        <div className='flex gap-3'>
          <div><label htmlFor='qh-s' className='mb-1 block text-xs text-muted-foreground'>From</label><Input id='qh-s' type='time' value={p.quiet_hours.start} disabled={!p.quiet_hours.enabled} onChange={(e) => setP({ ...p, quiet_hours: { ...p.quiet_hours, start: e.target.value } })} /></div>
          <div><label htmlFor='qh-e' className='mb-1 block text-xs text-muted-foreground'>To</label><Input id='qh-e' type='time' value={p.quiet_hours.end} disabled={!p.quiet_hours.enabled} onChange={(e) => setP({ ...p, quiet_hours: { ...p.quiet_hours, end: e.target.value } })} /></div>
        </div>
      </fieldset>
      <Msg m={msg} />
      <div><Button type='submit' disabled={busy}>{busy ? 'Saving...' : 'Save preferences'}</Button></div>
    </form>
  )
}

function AppearanceForm() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <div className='max-w-xs'>
      <label htmlFor='theme' className='mb-2 block text-sm font-medium'>Theme</label>
      <SelectField id='theme' value={mounted && theme === 'dark' ? 'dark' : 'light'} onChange={setTheme} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
      <p className='mt-2 text-xs text-muted-foreground'>Saved in this browser.</p>
    </div>
  )
}

export default function SettingsTabs() {
  const params = useSearchParams()
  const router = useRouter()
  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'security') as (typeof TABS)[number]['id']
  return (
    <>
      <BreadcrumbComp title='Account settings' items={[{ title: 'Home', to: '/dashboard' }, { title: 'Settings' }]} />
      <CardBox className='p-6'>
        <div role='tablist' aria-label='Settings sections' className='mb-6 flex flex-wrap gap-2'>
          {TABS.map((t) => (
            <Button key={t.id} role='tab' aria-selected={tab === t.id} size='sm' variant={tab === t.id ? 'default' : 'outline'} onClick={() => router.replace(`/settings?tab=${t.id}`)}>{t.label}</Button>
          ))}
        </div>
        {tab === 'security' && <PasswordForm />}
        {tab === 'notifications' && <NotificationForm />}
        {tab === 'appearance' && <AppearanceForm />}
      </CardBox>
    </>
  )
}
