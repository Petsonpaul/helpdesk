'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  body: string
  confirmLabel?: string
  destructive?: boolean
  onConfirm: () => Promise<unknown>
}

/** Used for consequential actions (deactivate, suspend, refund...). Shows server errors instead of hiding them. */
export default function ConfirmationDialog({ open, onOpenChange, title, body, confirmLabel = 'Confirm', destructive, onConfirm }: ConfirmationDialogProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run() {
    if (busy) return
    setBusy(true); setError('')
    try { await onConfirm(); onOpenChange(false) }
    catch (e) { setError(e instanceof Error ? e.message : 'The action failed.') }
    finally { setBusy(false) }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!busy) { setError(''); onOpenChange(o) } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        {error && <p role='alert' className='text-sm text-red-600'>{error}</p>}
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button variant={destructive ? 'destructive' : 'default'} onClick={run} disabled={busy}>{busy ? 'Working...' : confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
