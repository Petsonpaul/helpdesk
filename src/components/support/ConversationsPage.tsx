'use client'

import { FormEvent, useState } from 'react'
import useSWR from 'swr'
import ResourcePage from '@/components/shared/ResourcePage'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusPill } from '@/components/shared/Badges'
import { ErrorState, LoadingState } from '@/components/shared/StateViews'
import SelectField from '@/components/shared/SelectField'
import { api } from '@/lib/api-client'
import { formatDate } from '@/lib/formatters'

interface Row { id: number; subject: string; category: string; status: string; priority: string; organization?: string; sender?: string; last_message_at: string; awaiting_reply?: boolean }
interface Thread {
  id: number; subject: string; status: string; priority: string
  messages: { id: number; author: string; body: string; created_at: string; is_staff: boolean }[]
  can_reply: boolean; can_manage: boolean
}

const CATEGORIES = [
  { value: 'technical', label: 'Technical Issue' }, { value: 'billing', label: 'Billing' }, { value: 'account', label: 'Account Access' },
  { value: 'subscription', label: 'Subscription' }, { value: 'general', label: 'General Inquiry' }, { value: 'security', label: 'Security Concern' },
]

function ThreadDialog({ base, id, onClose, onChanged }: { base: string; id: number; onClose: () => void; onChanged: () => void }) {
  const { data, error, isLoading, mutate } = useSWR(['thread', base, id], async () => (await api.get<{ data: Thread }>(`${base}/${id}`)).data, { shouldRetryOnError: false })
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function send(e: FormEvent) {
    e.preventDefault()
    if (busy || !text.trim()) return
    setBusy(true); setErr('')
    try { await api.post(`${base}/${id}/messages`, { body: text }); setText(''); await mutate(); onChanged() }
    catch (x) { setErr(x instanceof Error ? x.message : 'Could not send.') }
    finally { setBusy(false) }
  }
  async function manage(field: 'status' | 'priority', value: string) {
    setErr('')
    try { await api.patch(`${base}/${id}`, { [field]: value }); await mutate(); onChanged() }
    catch (x) { setErr(x instanceof Error ? x.message : 'Could not update.') }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{data?.subject ?? 'Conversation'}</DialogTitle>
          <DialogDescription>{data ? `Status: ${data.status} | Priority: ${data.priority}` : ' '}</DialogDescription>
        </DialogHeader>
        {isLoading && <LoadingState />}
        {error && <ErrorState message={(error as Error).message} onRetry={() => mutate()} />}
        {data && (
          <div className='space-y-4'>
            {data.can_manage && (
              <div className='flex flex-wrap gap-3'>
                <div className='w-40'>
                  <label htmlFor='thr-status' className='mb-1 block text-xs'>Status</label>
                  <SelectField id='thr-status' value={data.status} onChange={(v) => manage('status', v)} options={['open', 'answered', 'pending', 'closed'].map((s) => ({ value: s, label: s }))} />
                </div>
                <div className='w-40'>
                  <label htmlFor='thr-priority' className='mb-1 block text-xs'>Priority</label>
                  <SelectField id='thr-priority' value={data.priority} onChange={(v) => manage('priority', v)} options={['low', 'normal', 'high', 'urgent'].map((s) => ({ value: s, label: s }))} />
                </div>
              </div>
            )}
            <ul className='space-y-3'>
              {data.messages.map((m) => (
                <li key={m.id} className={`rounded-md border border-border p-3 text-sm ${m.is_staff ? 'bg-lightprimary' : ''}`}>
                  <p className='mb-1 text-xs text-muted-foreground'>{m.author}{m.is_staff ? ' (Qelvoro)' : ''} · {formatDate(m.created_at, true)}</p>
                  <p className='whitespace-pre-wrap break-words'>{m.body}</p>
                </li>
              ))}
            </ul>
            {data.can_reply && (
              <form onSubmit={send} className='space-y-2'>
                <label htmlFor='thread-reply' className='sr-only'>Reply</label>
                <Textarea id='thread-reply' rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder='Write a reply' />
                <Button type='submit' disabled={busy || !text.trim()}>{busy ? 'Sending...' : 'Send reply'}</Button>
              </form>
            )}
            {err && <p role='alert' className='text-sm text-red-600'>{err}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** mode "organization": your own conversations with Qelvoro. mode "admin": the platform support inbox. */
export default function ConversationsPage({ mode }: { mode: 'organization' | 'admin' }) {
  const admin = mode === 'admin'
  const base = admin ? '/platform-admin/support' : '/platform-support'
  const [openId, setOpenId] = useState<number | null>(null)
  const [version, setVersion] = useState(0)

  return (
    <>
      <ResourcePage<Row>
        key={version}
        title={admin ? 'Platform support' : 'Contact Qelvoro'}
        crumbs={[{ title: 'Home', to: admin ? '/platform-admin' : '/admin' }, { title: admin ? 'Platform support' : 'Platform support' }]}
        endpoint={base}
        searchPlaceholder='Search conversations'
        filters={[
          { key: 'status', label: 'Status', options: ['open', 'answered', 'pending', 'closed'].map((s) => ({ value: s, label: s })) },
          ...(admin ? [{ key: 'priority', label: 'Priority', options: ['low', 'normal', 'high', 'urgent'].map((s) => ({ value: s, label: s })) }, { key: 'awaiting_reply', label: 'Unanswered', options: [{ value: '1', label: 'Awaiting reply' }] }] : []),
        ]}
        columns={[
          { key: 'subject', header: 'Subject' },
          ...(admin ? [{ key: 'organization', header: 'Organisation' }, { key: 'sender', header: 'Sender' }] : []),
          { key: 'category', header: 'Category' },
          { key: 'status', header: 'Status', render: (r: Row) => <StatusPill value={r.status} /> },
          { key: 'priority', header: 'Priority' },
          { key: 'last_message_at', header: 'Last message', render: (r: Row) => formatDate(r.last_message_at, true) },
        ]}
        form={admin ? undefined : {
          noun: 'conversation', createLabel: 'New conversation', canEdit: false,
          fields: [
            { name: 'category', label: 'Category', type: 'select', options: CATEGORIES, required: true },
            { name: 'subject', label: 'Subject', required: true },
            { name: 'body', label: 'Description', type: 'textarea', required: true },
          ],
        }}
        renderRowExtra={(r) => <Button size='sm' variant='outline' onClick={() => setOpenId(r.id)}>Open</Button>}
      />
      {openId !== null && <ThreadDialog base={base} id={openId} onClose={() => setOpenId(null)} onChanged={() => setVersion((v) => v + 1)} />}
    </>
  )
}
