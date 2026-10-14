'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, ApiError } from '@/lib/api-client'
import AuthShell from '@/components/auth/AuthShell'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.')
    setError(''); setStatus('loading')
    try {
      await api.post('/auth/forgot-password', { email })
      setStatus('sent')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof ApiError ? (err.fieldErrors.email?.[0] ?? err.message) : 'Something went wrong.')
    }
  }

  return (
    <AuthShell title='Forgot your password?' subtitle='Enter your email and we will send you a reset link.'>
      {status === 'sent' ? (
        <p role='status' className='text-sm text-center'>If an account exists for that address, a reset link is on its way.</p>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <Label htmlFor='fp-email' className='mb-2 block font-medium'>Email</Label>
          <Input id='fp-email' type='email' autoComplete='email' value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} aria-describedby={error ? 'fp-err' : undefined} />
          {error && <p id='fp-err' role='alert' className='mt-1 text-xs text-red-600'>{error}</p>}
          <Button type='submit' className='w-full mt-6' disabled={status === 'loading'}>{status === 'loading' ? 'Sending...' : 'Send reset link'}</Button>
        </form>
      )}
      <p className='mt-6 text-center text-sm'><Link href='/login' className='font-medium text-primary'>Back to login</Link></p>
    </AuthShell>
  )
}
