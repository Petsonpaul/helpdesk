'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/StateViews'
import SelectField from '@/components/shared/SelectField'
import { useOptions } from '@/hooks/use-options'
import { addTeamMember, listTeamMembers, removeTeamMember } from '@/services/team.service'

export default function TeamMembersDialog({ teamId, teamName, onClose }: { teamId: number | string; teamName: string; onClose: () => void }) {
  const { data, error, isLoading, mutate } = useSWR(['team-members', teamId], () => listTeamMembers(teamId), { shouldRetryOnError: false })
  const { options } = useOptions('/options/users?role=technician')
  const [selected, setSelected] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const run = async (fn: () => Promise<unknown>) => {
    if (busy) return
    setBusy(true); setErr('')
    try { await fn(); await mutate() } catch (e) { setErr(e instanceof Error ? e.message : 'The action failed.') } finally { setBusy(false) }
  }
  const memberIds = new Set((data ?? []).map((m) => String(m.id)))

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{teamName} members</DialogTitle>
          <DialogDescription>Add or remove the people who resolve this team&apos;s tickets.</DialogDescription>
        </DialogHeader>
        {isLoading && <LoadingState />}
        {error && <ErrorState message={(error as Error).message} onRetry={() => mutate()} />}
        {data && (data.length === 0 ? <EmptyState title='No members yet' /> : (
          <ul className='divide-y divide-border'>
            {data.map((m) => (
              <li key={m.id} className='flex items-center justify-between gap-3 py-2 text-sm'>
                <span className='min-w-0'><span className='block truncate font-medium'>{m.name}</span><span className='block truncate text-xs text-muted-foreground'>{m.email}</span></span>
                <Button size='sm' variant='outline' disabled={busy} onClick={() => run(() => removeTeamMember(teamId, m.id))}>Remove</Button>
              </li>
            ))}
          </ul>
        ))}
        <div className='flex items-end gap-2'>
          <div className='flex-1'>
            <label htmlFor='add-member' className='mb-1 block text-xs text-muted-foreground'>Add technician</label>
            <SelectField id='add-member' value={selected} onChange={setSelected} options={options.filter((o) => !memberIds.has(String(o.value)))} placeholder='Select...' />
          </div>
          <Button disabled={!selected || busy} onClick={() => run(async () => { await addTeamMember(teamId, selected); setSelected('') })}>Add</Button>
        </div>
        {err && <p role='alert' className='text-sm text-red-600'>{err}</p>}
      </DialogContent>
    </Dialog>
  )
}
