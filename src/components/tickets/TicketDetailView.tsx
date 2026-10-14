'use client'

import { FormEvent, useState } from 'react'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import BreadcrumbComp from '@/components/layout/BreadcrumbComp'
import CardBox from '@/components/shared/CardBox'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ErrorState, LoadingState } from '@/components/shared/StateViews'
import { PriorityBadge, TicketStatusBadge } from '@/components/shared/Badges'
import SelectField from '@/components/shared/SelectField'
import EntityForm from '@/components/shared/EntityForm'
import AttachmentPicker, { checkFiles } from './AttachmentPicker'
import { useOptions } from '@/hooks/use-options'
import { formatBytes, formatDate } from '@/lib/formatters'
import { acknowledgeTicket, addNote, addReply, assignTicket, changeStatus, claimTicket, escalateTicket, getTicket } from '@/services/ticket.service'
import { STATUS_LABEL, type Attachment, type TicketStatus } from '@/types/ticket'

function Attachments({ items }: { items?: Attachment[] }) {
  if (!items || items.length === 0) return null
  return (
    <ul className='mt-2 flex flex-wrap gap-2'>
      {items.map((a) => (
        <li key={a.id}>
          {/* download_url is created and authorised by Laravel for this user and ticket */}
          <a href={a.download_url} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:text-primary'>
            <Icon icon='tabler:paperclip' width='14' aria-hidden='true' />{a.name} ({formatBytes(a.size)})
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function TicketDetailView({ id }: { id: string }) {
  const { data: t, error, isLoading, mutate } = useSWR(['ticket', id], () => getTicket(id), { shouldRetryOnError: false })
  const [teamId, setTeamId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [status, setStatus] = useState('')
  const [reply, setReply] = useState('')
  const [replyFiles, setReplyFiles] = useState<File[]>([])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [escalating, setEscalating] = useState(false)
  const teams = useOptions(t?.permissions.can_assign ? '/options/teams' : undefined)
  const techs = useOptions(t?.permissions.can_assign ? `/options/users?role=technician${teamId ? `&team_id=${teamId}` : ''}` : undefined)

  const run = async (fn: () => Promise<unknown>) => {
    if (busy) return
    setBusy(true); setErr('')
    try { await fn(); await mutate() } catch (e) { setErr(e instanceof Error ? e.message : 'The action failed.') } finally { setBusy(false) }
  }

  async function sendReply(e: FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    const problem = checkFiles(replyFiles, 10, [])
    if (problem) return setErr(problem)
    const form = new FormData()
    form.append('body', reply)
    replyFiles.forEach((f) => form.append('attachments[]', f))
    await run(async () => { await addReply(id, form); setReply(''); setReplyFiles([]) })
  }
  async function sendNote(e: FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    await run(async () => { await addNote(id, note); setNote('') })
  }

  return (
    <>
      <BreadcrumbComp title={t ? t.reference : 'Ticket'} items={[{ title: 'Home', to: '/dashboard' }, { title: 'Tickets', to: '/tickets' }, { title: t?.reference ?? 'Details' }]} />
      {isLoading && <LoadingState />}
      {error && <ErrorState message={(error as Error).message} onRetry={() => mutate()} />}
      {t && (
        <div className='grid gap-6 xl:grid-cols-3'>
          <div className='space-y-6 xl:col-span-2'>
            <CardBox className='p-6'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <h2 className='min-w-0 break-words text-lg font-semibold'>{t.subject}</h2>
                <div className='flex flex-wrap gap-2'><TicketStatusBadge status={t.status} /><PriorityBadge priority={t.priority} /></div>
              </div>
              <p className='mt-4 whitespace-pre-wrap break-words text-sm'>{t.description}</p>
              <Attachments items={t.attachments} />
            </CardBox>

            <CardBox className='p-6'>
              <h3 className='mb-4 text-base font-semibold'>Conversation</h3>
              {t.replies.length === 0 && <p className='text-sm text-muted-foreground'>No replies yet.</p>}
              <ul className='space-y-3'>
                {t.replies.map((m) => (
                  <li key={m.id} className='rounded-md border border-border p-3 text-sm'>
                    <p className='mb-1 text-xs text-muted-foreground'>{m.author} · {formatDate(m.created_at, true)}</p>
                    <p className='whitespace-pre-wrap break-words'>{m.body}</p>
                    <Attachments items={m.attachments} />
                  </li>
                ))}
              </ul>
              {t.permissions.can_reply && (
                <form onSubmit={sendReply} className='mt-5 space-y-3'>
                  <label htmlFor='reply' className='block text-sm font-medium'>Reply</label>
                  <Textarea id='reply' rows={4} value={reply} onChange={(e) => setReply(e.target.value)} />
                  <AttachmentPicker files={replyFiles} onChange={setReplyFiles} maxMb={10} allowed={[]} disabled={busy} />
                  <Button type='submit' disabled={busy || !reply.trim()}>{busy ? 'Sending...' : 'Send reply'}</Button>
                </form>
              )}
            </CardBox>

            {t.permissions.can_add_note && (
              <CardBox className='border-2 border-dashed border-warning p-6'>
                <h3 className='mb-1 flex items-center gap-2 text-base font-semibold'><Icon icon='tabler:lock' aria-hidden='true' />Internal notes</h3>
                <p className='mb-4 text-xs text-muted-foreground'>Private to support staff. The requester never sees these.</p>
                <ul className='space-y-3'>
                  {(t.notes ?? []).map((n) => (
                    <li key={n.id} className='rounded-md bg-lightwarning p-3 text-sm'>
                      <p className='mb-1 text-xs text-muted-foreground'>{n.author} · {formatDate(n.created_at, true)} · Internal note</p>
                      <p className='whitespace-pre-wrap break-words'>{n.body}</p>
                    </li>
                  ))}
                </ul>
                <form onSubmit={sendNote} className='mt-4 space-y-3'>
                  <label htmlFor='note' className='sr-only'>Internal note</label>
                  <Textarea id='note' rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder='Add a private note' />
                  <Button type='submit' variant='outline' disabled={busy || !note.trim()}>Add internal note</Button>
                </form>
              </CardBox>
            )}
          </div>

          <div className='space-y-6'>
            <CardBox className='p-6'>
              <h3 className='mb-3 text-base font-semibold'>Details</h3>
              <dl className='space-y-3 text-sm'>
                {([['Requester', t.requester], ['Department', t.department], ['Category', t.category], ['Support team', t.team], ['Assigned to', t.assignee ?? 'Unassigned'], ['Created', formatDate(t.created_at, true)], ['Last updated', formatDate(t.updated_at, true)], ['Due', t.due_at ? formatDate(t.due_at, true) : null]] as [string, string | null | undefined][])
                  .filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className='text-xs text-muted-foreground'>{k}</dt><dd className='font-medium'>{v}</dd></div>)}
              </dl>
            </CardBox>

            {(t.permissions.can_claim || t.permissions.can_acknowledge || t.permissions.can_change_status || t.permissions.can_assign || t.permissions.can_escalate) && (
              <CardBox className='space-y-4 p-6'>
                <h3 className='text-base font-semibold'>Actions</h3>
                {t.permissions.can_claim && <Button className='w-full' disabled={busy} onClick={() => run(() => claimTicket(id))}>Claim this ticket</Button>}
                {t.permissions.can_acknowledge && <Button className='w-full' variant='outline' disabled={busy} onClick={() => run(() => acknowledgeTicket(id))}>Acknowledge</Button>}
                {t.permissions.can_change_status && t.allowed_transitions.length > 0 && (
                  <div>
                    <label htmlFor='status' className='mb-1 block text-xs text-muted-foreground'>Change status</label>
                    <div className='flex gap-2'>
                      <div className='min-w-0 flex-1'><SelectField id='status' value={status} onChange={setStatus} options={t.allowed_transitions.map((s) => ({ value: s, label: STATUS_LABEL[s] }))} placeholder='Select...' /></div>
                      <Button disabled={!status || busy} onClick={() => run(async () => { await changeStatus(id, status as TicketStatus); setStatus('') })}>Apply</Button>
                    </div>
                  </div>
                )}
                {t.permissions.can_assign && (
                  <div className='space-y-2'>
                    <label htmlFor='asg-team' className='block text-xs text-muted-foreground'>Assign to team</label>
                    <SelectField id='asg-team' value={teamId} onChange={(val) => { setTeamId(val); setAssigneeId('') }} options={teams.options} clearLabel='Keep current' />
                    <label htmlFor='asg-user' className='block text-xs text-muted-foreground'>Assign to technician</label>
                    <SelectField id='asg-user' value={assigneeId} onChange={setAssigneeId} options={techs.options} clearLabel='Keep current' />
                    <Button className='w-full' variant='outline' disabled={busy || (!teamId && !assigneeId)}
                      onClick={() => run(async () => { await assignTicket(id, { team_id: teamId || undefined, assignee_id: assigneeId || undefined }); setTeamId(''); setAssigneeId('') })}>Assign</Button>
                  </div>
                )}
                {t.permissions.can_escalate && <Button className='w-full' variant='outline' disabled={busy} onClick={() => setEscalating(true)}>Escalate</Button>}
                {err && <p role='alert' className='text-sm text-red-600'>{err}</p>}
              </CardBox>
            )}

            <CardBox className='p-6'>
              <h3 className='mb-3 text-base font-semibold'>History</h3>
              <ol className='space-y-3 border-s border-border ps-4'>
                {t.history.map((h) => (
                  <li key={h.id} className='text-sm'><p>{h.text}</p><p className='text-xs text-muted-foreground'>{formatDate(h.created_at, true)}</p></li>
                ))}
              </ol>
            </CardBox>
          </div>
        </div>
      )}
      <EntityForm open={escalating} onOpenChange={setEscalating} title='Escalate ticket' description='Tell the team why this ticket needs attention.'
        fields={[{ name: 'reason', label: 'Reason', type: 'textarea', required: true }]} submitLabel='Escalate'
        onSubmit={async (v) => { await escalateTicket(id, String(v.reason)); await mutate() }} />
    </>
  )
}
