'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import BreadcrumbComp from '@/components/layout/BreadcrumbComp'
import CardBox from '@/components/shared/CardBox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ErrorState, LoadingState } from '@/components/shared/StateViews'
import { FormField } from '@/components/shared/FormField'
import SelectField from '@/components/shared/SelectField'
import AttachmentPicker, { checkFiles } from './AttachmentPicker'
import { ApiError } from '@/lib/api-client'
import { createTicket, getTicketFormOptions } from '@/services/ticket.service'
import { useAuth } from '@/hooks/use-auth'

export default function CreateTicketForm() {
  const { user } = useAuth()
  const noun = user?.role === 'customer' ? 'support request' : 'ticket'
  const { data: opts, error, isLoading, mutate } = useSWR('ticket-form-options', getTicketFormOptions, { shouldRetryOnError: false })
  const [v, setV] = useState({ subject: '', description: '', department_id: '', category_id: '', priority: '' })
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [createdId, setCreatedId] = useState<number | string | null>(null)
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }))
  const pick = (k: keyof typeof v) => (val: string) => setV((p) => ({ ...p, [k]: val }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy || !opts) return
    const found: Record<string, string> = {}
    if (v.subject.trim().length < 3) found.subject = 'Please enter a subject.'
    if (v.description.trim().length < 10) found.description = 'Please describe the issue (at least 10 characters).'
    const fileProblem = checkFiles(files, opts.max_attachment_mb, opts.allowed_extensions)
    if (fileProblem) found.attachments = fileProblem
    setErrors(found)
    if (Object.keys(found).length) return
    const form = new FormData()
    Object.entries(v).forEach(([k, val]) => { if (val) form.append(k, val) })
    files.forEach((f) => form.append('attachments[]', f))
    setBusy(true); setFormError('')
    try { const res = await createTicket(form); setCreatedId(res.data.id) }
    catch (err) {
      if (err instanceof ApiError) setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, m]) => [k, m[0]])))
      setFormError(err instanceof Error ? err.message : 'Could not create the ticket.')
    } finally { setBusy(false) }
  }

  return (
    <>
      <BreadcrumbComp title={`Create ${noun}`} items={[{ title: 'Home', to: '/dashboard' }, { title: 'Tickets', to: '/tickets' }, { title: 'Create' }]} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={(error as Error).message} onRetry={() => mutate()} />}
      {createdId !== null && (
        <CardBox className='max-w-2xl p-6 text-center'>
          <div role='status'>
            <h3 className='text-lg font-semibold'>Your {noun} was submitted</h3>
            <p className='mt-1 text-sm text-muted-foreground'>You will be notified when there is an update.</p>
            <div className='mt-4 flex justify-center gap-3'>
              <Button asChild><Link href={`/tickets/${createdId}`}>View {noun}</Link></Button>
              <Button variant='outline' onClick={() => { setCreatedId(null); setV({ subject: '', description: '', department_id: '', category_id: '', priority: '' }); setFiles([]) }}>Create another</Button>
            </div>
          </div>
        </CardBox>
      )}
      {opts && createdId === null && (
        <CardBox className='max-w-2xl p-6'>
          <form onSubmit={submit} noValidate className='flex flex-col gap-5'>
            <FormField id='t-subject' label='Subject' error={errors.subject}><Input id='t-subject' value={v.subject} onChange={set('subject')} aria-invalid={!!errors.subject} /></FormField>
            <FormField id='t-desc' label='Description' error={errors.description}><Textarea id='t-desc' rows={6} value={v.description} onChange={set('description')} aria-invalid={!!errors.description} /></FormField>
            {opts.departments.length > 0 && (
              <FormField id='t-dept' label='Department' error={errors.department_id}>
                <SelectField id='t-dept' value={v.department_id} onChange={pick('department_id')} options={opts.departments} placeholder='Select...' />
              </FormField>
            )}
            <FormField id='t-cat' label='Category' error={errors.category_id}>
              <SelectField id='t-cat' value={v.category_id} onChange={pick('category_id')} options={opts.categories} placeholder='Select...' />
            </FormField>
            {opts.can_set_priority && (
              <FormField id='t-prio' label='Priority' error={errors.priority}>
                <SelectField id='t-prio' value={v.priority} onChange={pick('priority')} options={opts.priorities} clearLabel='Default' />
              </FormField>
            )}
            <AttachmentPicker files={files} onChange={setFiles} maxMb={opts.max_attachment_mb} allowed={opts.allowed_extensions} disabled={busy} />
            {errors.attachments && <p role='alert' className='-mt-3 text-xs text-red-600'>{errors.attachments}</p>}
            {formError && <p role='alert' className='text-sm text-red-600'>{formError}</p>}
            <div><Button type='submit' disabled={busy}>{busy ? 'Submitting...' : `Submit ${noun}`}</Button></div>
          </form>
        </CardBox>
      )}
    </>
  )
}
