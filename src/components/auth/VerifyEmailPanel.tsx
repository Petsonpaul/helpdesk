'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { api, ApiError } from '@/lib/api-client'
import AuthShell from '@/components/auth/AuthShell'

export default function VerifyEmailPanel() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function resend() {
    if (status === 'loading') return
    setStatus('loading'); setMessage('')
    try {
      await api.post('/auth/email/verification-notification')
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof ApiError && err.isUnauthenticated ? 'Please log in first, then request a new verification email.' : err instanceof ApiError ? err.message : 'Something went wrong.')
    }
  }

  return (
    <AuthShell title='Verify your email' subtitle='We sent a verification link to your email address. Open it to finish setting up your account.'>
      {status === 'sent' && <p role='status' className='mb-4 text-center text-sm'>A new verification email has been sent.</p>}
      {status === 'error' && <p role='alert' className='mb-4 text-center text-sm text-red-600'>{message}</p>}
      <Button className='w-full' onClick={resend} disabled={status === 'loading'}>{status === 'loading' ? 'Sending...' : 'Resend verification email'}</Button>
      <p className='mt-6 text-center text-sm'><Link href='/login' className='font-medium text-primary'>Back to login</Link></p>
    </AuthShell>
  )
}
