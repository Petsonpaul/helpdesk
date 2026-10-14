'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import StackedLogo from '@/components/layout/logo/StackedLogo'
import CardBox from '@/components/shared/CardBox'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/api-client'
import { canAccessPath, ROLE_HOME } from '@/lib/permissions'
import { safeNextPath } from '@/lib/session'
import { login } from '@/services/auth.service'

export const Login = () => {
  const router = useRouter()
  const params = useSearchParams()
  const expired = params.get('reason') === 'expired'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    const found: Record<string, string> = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) found.email = 'Please enter a valid email address.'
    if (!password) found.password = 'Please enter your password.'
    setErrors(found); setFormError('')
    if (Object.keys(found).length) return
    setBusy(true)
    try {
      const user = await login({ email, password, remember })
      // Return to where the person was, but only to a safe in-app page their role may open.
      const next = safeNextPath(params.get('next'))
      const target = next && canAccessPath(user.role, next.split(/[?#]/)[0]) ? next : (ROLE_HOME[user.role] ?? '/dashboard')
      router.replace(target)
    } catch (err) {
      if (err instanceof ApiError && err.isValidation) setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k, v[0]])))
      setFormError(err instanceof ApiError ? (err.status === 429 ? 'Too many attempts. Please wait a moment and try again.' : err.message) : 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <>
      <div className='min-h-screen w-full flex justify-center items-center bg-lightprimary px-4'>
        <div className='w-full max-w-[450px]'>
          <CardBox>
            <div className='flex justify-center mb-2'>
              <StackedLogo />
            </div>
            <p className='text-sm text-muted-foreground text-center mb-6'>
              Welcome to Qelvoro
            </p>
            {expired && <p role='status' className='mb-4 rounded-md bg-lightwarning p-3 text-center text-sm'>Your session has expired. Please sign in again.</p>}
            <form onSubmit={onSubmit} noValidate>
              <div>
                <div className='mb-2 block'>
                  <Label htmlFor='email1' className='font-medium'>Email</Label>
                </div>
                <Input id='email1' type='email' autoComplete='email' placeholder='Enter your email' value={email}
                  onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email1-err' : undefined} />
                {errors.email && <p id='email1-err' role='alert' className='mt-1 text-xs text-red-600'>{errors.email}</p>}
              </div>
              <div className='mt-6'>
                <div className='mb-2 block'>
                  <Label htmlFor='password1' className='font-medium'>Password</Label>
                </div>
                <Input id='password1' type='password' autoComplete='current-password' placeholder='Enter your password' value={password}
                  onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password1-err' : undefined} />
                {errors.password && <p id='password1-err' role='alert' className='mt-1 text-xs text-red-600'>{errors.password}</p>}
              </div>
              <div className='flex flex-wrap gap-6 items-center justify-between my-6'>
                <div className='flex items-center gap-2'>
                  <Checkbox id='remember' checked={remember} onCheckedChange={(c) => setRemember(c === true)} />
                  <Label className='text-link font-normal text-sm' htmlFor='remember'>Remember this device</Label>
                </div>
                <Link href='/forgot-password' className='text-sm font-medium text-primary hover:text-primaryemphasis'>
                  Forgot Password ?
                </Link>
              </div>
              {formError && <p role='alert' className='mb-4 text-sm text-red-600'>{formError}</p>}
              <Button type='submit' className='w-full' disabled={busy}>{busy ? 'Signing in...' : 'Sign In'}</Button>
            </form>
            <div className='flex items center gap-2 justify-center mt-6 flex-wrap'>
              <p className='text-base font-medium text-muted-foreground'>New to Qelvoro?</p>
              <Link href='/register' className='text-sm font-medium text-primary hover:text-primaryemphasis'>Create an account</Link>
            </div>
          </CardBox>
        </div>
      </div>
    </>
  )
}
