'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, ApiError } from '@/lib/api-client'
import AuthShell from '@/components/auth/AuthShell'

export default function ResetPasswordForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    if (!token) return setError('This reset link is missing its token. Please request a new one.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setError(''); setStatus('loading')
    try {
      await api.post('/auth/reset-password', { token, email, password, password_confirmation: confirm })
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof ApiError ? (Object.values(err.fieldErrors)[0]?.[0] ?? err.message) : 'Something went wrong.')
    }
  }

  return (
    <AuthShell title='Reset your password' subtitle='Choose a new password for your account.'>
      {status === 'done' ? (
        <p role='status' className='text-sm text-center'>Your password has been reset. <Link href='/login' className='font-medium text-primary'>Log in</Link></p>
      ) : (
        <form onSubmit={onSubmit} noValidate className='flex flex-col gap-4'>
          <div><Label htmlFor='rp-email' className='mb-2 block font-medium'>Email</Label>
            <Input id='rp-email' type='email' autoComplete='email' value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label htmlFor='rp-pass' className='mb-2 block font-medium'>New password</Label>
            <Input id='rp-pass' type='password' autoComplete='new-password' value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <div><Label htmlFor='rp-conf' className='mb-2 block font-medium'>Confirm password</Label>
            <Input id='rp-conf' type='password' autoComplete='new-password' value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          {error && <p role='alert' className='text-sm text-red-600'>{error}</p>}
          <Button type='submit' disabled={status === 'loading'}>{status === 'loading' ? 'Saving...' : 'Reset password'}</Button>
        </form>
      )}
    </AuthShell>
  )
}
