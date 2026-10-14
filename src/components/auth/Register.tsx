'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import StackedLogo from '@/components/layout/logo/StackedLogo'
import CardBox from '@/components/shared/CardBox'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { registerOrganization } from '@/services/auth.service'

type V = { name: string; email: string; organization_name: string; password: string; password_confirmation: string }

export const Register = () => {
  const router = useRouter()
  const [v, setV] = useState<V>({ name: '', email: '', organization_name: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof V) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    const f: Record<string, string> = {}
    if (v.name.trim().length < 2) f.name = 'Please enter your name.'
    if (!/^\S+@\S+\.\S+$/.test(v.email)) f.email = 'Please enter a valid email address.'
    if (v.organization_name.trim().length < 2) f.organization_name = 'Please enter your organisation name.'
    if (v.password.length < 8) f.password = 'Password must be at least 8 characters.'
    if (v.password !== v.password_confirmation) f.password_confirmation = 'Passwords do not match.'
    setErrors(f); setFormError('')
    if (Object.keys(f).length) return
    setBusy(true)
    try { await registerOrganization(v); router.replace('/verify-email') }
    catch (err) {
      if (err instanceof ApiError && err.isValidation) setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, m]) => [k, m[0]])))
      setFormError(err instanceof Error ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  const field = (k: keyof V, label: string, type = 'text', auto?: string) => (
    <div className='mt-6 first:mt-0'>
      <div className='mb-2 block'><Label htmlFor={`reg-${k}`} className='font-medium'>{label}</Label></div>
      <Input id={`reg-${k}`} type={type} autoComplete={auto} value={v[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `reg-${k}-err` : undefined} />
      {errors[k] && <p id={`reg-${k}-err`} role='alert' className='mt-1 text-xs text-red-600'>{errors[k]}</p>}
    </div>
  )

  return (
    <>
      <div className='min-h-screen w-full flex justify-center items-center bg-lightprimary px-4 py-8'>
        <div className='w-full max-w-[450px]'>
          <CardBox>
            <div className='flex justify-center mb-2'>
              <StackedLogo />
            </div>
            <p className='text-sm text-muted-foreground text-center mb-6'>Create your Qelvoro account</p>
            <form onSubmit={onSubmit} noValidate>
              {field('name', 'Your name', 'text', 'name')}
              {field('email', 'Email', 'email', 'email')}
              {field('organization_name', 'Organisation name')}
              {field('password', 'Password', 'password', 'new-password')}
              {field('password_confirmation', 'Confirm password', 'password', 'new-password')}
              {formError && <p role='alert' className='mt-4 text-sm text-red-600'>{formError}</p>}
              <Button type='submit' className='w-full mt-6' disabled={busy}>{busy ? 'Creating account...' : 'Sign Up'}</Button>
            </form>
            <div className='flex items center gap-2 justify-center mt-6 flex-wrap'>
              <p className='text-base font-medium text-muted-foreground'>Already have an account?</p>
              <Link href='/login' className='text-sm font-medium text-primary hover:text-primaryemphasis'>Sign In</Link>
            </div>
          </CardBox>
        </div>
      </div>
    </>
  )
}
