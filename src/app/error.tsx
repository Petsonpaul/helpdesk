'use client'

import { Button } from '@/components/ui/button'

/** Route-level error boundary: shows a friendly message instead of a blank crash. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center'>
      <h2 className='text-xl font-semibold'>Something went wrong</h2>
      <p className='max-w-md text-sm text-muted-foreground'>
        An unexpected error occurred. You can try again, and if it keeps happening, contact support.
      </p>
      {error.digest && <p className='text-xs text-muted-foreground'>Reference: {error.digest}</p>}
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
