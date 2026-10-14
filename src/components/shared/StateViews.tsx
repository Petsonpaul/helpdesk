'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div role='status' aria-live='polite' className='flex min-h-[40vh] flex-col items-center justify-center gap-3 p-6'>
      <Skeleton className='h-3 w-40' /><Skeleton className='h-3 w-56' /><Skeleton className='h-3 w-32' />
      <span className='sr-only'>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role='alert' className='flex min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center'>
      <h2 className='text-lg font-semibold'>Something went wrong</h2>
      <p className='max-w-md text-sm text-muted-foreground'>{message}</p>
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className='flex flex-col items-center justify-center gap-2 p-8 text-center'>
      <p className='font-medium'>{title}</p>
      {children && <p className='text-sm text-muted-foreground'>{children}</p>}
    </div>
  )
}
