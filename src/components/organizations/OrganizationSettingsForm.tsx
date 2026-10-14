'use client'

import { FormEvent, useEffect, useState } from 'react'
import useSWR from 'swr'
import BreadcrumbComp from '@/components/layout/BreadcrumbComp'
import CardBox from '@/components/shared/CardBox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ErrorState, LoadingState } from '@/components/shared/StateViews'
import { FormField } from '@/components/shared/FormField'
import { ApiError } from '@/lib/api-client'
import { getOrganizationSettings, updateOrganizationSettings } from '@/services/organization.service'

export default function OrganizationSettingsForm() {
  const { data, error, isLoading, mutate } = useSWR('org-settings', getOrganizationSettings, { shouldRetryOnError: false })
  const [name, setName] = useState('')
  const [external, setExternal] = useState(false)
  const [minutes, setMinutes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (data) { setName(data.name); setExternal(data.external_support_enabled); setMinutes(data.acknowledgement_minutes === null ? '' : String(data.acknowledgement_minutes)) }
  }, [data])

  async function save(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true); setMsg(null); setErrors({})
    try {
      await updateOrganizationSettings({ name, external_support_enabled: external, acknowledgement_minutes: minutes === '' ? null : Number(minutes) })
      await mutate(); setMsg({ ok: true, text: 'Settings saved.' })
    } catch (err) {
      if (err instanceof ApiError) setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k, v[0]])))
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Could not save.' })
    } finally { setBusy(false) }
  }

  return (
    <>
      <BreadcrumbComp title='Organisation settings' items={[{ title: 'Home', to: '/admin' }, { title: 'Settings' }]} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={(error as Error).message} onRetry={() => mutate()} />}
      {data && (
        <CardBox className='max-w-2xl p-6'>
          <form onSubmit={save} noValidate className='flex flex-col gap-5'>
            <FormField id='os-name' label='Organisation name' error={errors.name}><Input id='os-name' value={name} onChange={(e) => setName(e.target.value)} /></FormField>
            <FormField id='os-ack' label='Escalate unacknowledged tickets after (minutes)' error={errors.acknowledgement_minutes} help='Leave empty to turn automatic escalation off.'>
              <Input id='os-ack' type='number' min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
            </FormField>
            <div>
              <label className='flex items-center gap-2 text-sm font-medium'>
                <input type='checkbox' className='h-4 w-4' checked={external} onChange={(e) => setExternal(e.target.checked)} /> Enable external customer support portal
              </label>
              <p className='mt-1 text-xs text-muted-foreground'>When on, your customers can submit and track requests. Laravel enforces this setting.</p>
            </div>
            {msg && <p role={msg.ok ? 'status' : 'alert'} className={`text-sm ${msg.ok ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>}
            <div><Button type='submit' disabled={busy}>{busy ? 'Saving...' : 'Save settings'}</Button></div>
          </form>
        </CardBox>
      )}
    </>
  )
}
