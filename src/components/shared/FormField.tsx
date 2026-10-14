'use client'

import { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

export const selectClass =
  'h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60'

export function FormField({ id, label, error, help, children }: { id: string; label: string; error?: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className='mb-2 block font-medium'>{label}</Label>
      {children}
      {help && !error && <p className='mt-1 text-xs text-muted-foreground'>{help}</p>}
      {error && <p id={`${id}-err`} role='alert' className='mt-1 text-xs text-red-600'>{error}</p>}
    </div>
  )
}
