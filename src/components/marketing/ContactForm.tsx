'use client'

import { useState, FormEvent } from 'react'
import CardBox from '@/components/shared/CardBox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api, ApiError } from '@/lib/api-client'

type Fields = { name: string; email: string; subject: string; message: string }
const EMPTY: Fields = { name: '', email: '', subject: '', message: '' }

function validate(v: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {}
  if (v.name.trim().length < 2) e.name = 'Please enter your name.'
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = 'Please enter a valid email address.'
  if (v.subject.trim().length < 3) e.subject = 'Please enter a subject.'
  if (v.message.trim().length < 10) e.message = 'Please write at least 10 characters.'
  return e
}

export default function ContactForm() {
  const [values, setValues] = useState<Fields>(EMPTY)
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formError, setFormError] = useState('')

  const set = (k: keyof Fields) => (e: { target: { value: string } }) => setValues((p) => ({ ...p, [k]: e.target.value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (status === 'loading') return // block duplicate submissions
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return
    setStatus('loading'); setFormError('')
    try {
      // Server-side validation, rate limiting and spam checks are enforced by Laravel (POST /api/v1/contact).
      await api.post('/contact', { ...values, website: honeypot })
      setStatus('success'); setValues(EMPTY)
    } catch (err) {
      if (err instanceof ApiError && err.isValidation) {
        setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k, v[0]])))
      }
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <CardBox className='p-8 text-center' >
        <div role='status'>
          <h3 className='text-lg font-semibold'>Message sent</h3>
          <p className='mt-2 text-sm text-muted-foreground'>Thank you for contacting us. We will reply by email.</p>
          <Button className='mt-5' variant='outline' onClick={() => setStatus('idle')}>Send another message</Button>
        </div>
      </CardBox>
    )
  }

  const field = (id: keyof Fields, label: string, type = 'text') => (
    <div>
      <Label htmlFor={`c-${id}`} className='mb-2 block font-medium'>{label}</Label>
      <Input id={`c-${id}`} type={type} value={values[id]} onChange={set(id)} aria-invalid={!!errors[id]}
        aria-describedby={errors[id] ? `c-${id}-err` : undefined} autoComplete={id === 'email' ? 'email' : id === 'name' ? 'name' : 'off'} />
      {errors[id] && <p id={`c-${id}-err`} className='mt-1 text-xs text-red-600'>{errors[id]}</p>}
    </div>
  )

  return (
    <CardBox className='p-6 md:p-8'>
      <form onSubmit={onSubmit} noValidate className='flex flex-col gap-5'>
        {field('name', 'Full name')}
        {field('email', 'Email address', 'email')}
        {field('subject', 'Subject')}
        <div>
          <Label htmlFor='c-message' className='mb-2 block font-medium'>Message</Label>
          <Textarea id='c-message' rows={5} value={values.message} onChange={set('message')} aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'c-message-err' : undefined} />
          {errors.message && <p id='c-message-err' className='mt-1 text-xs text-red-600'>{errors.message}</p>}
        </div>
        {/* Honeypot: hidden from people, bots tend to fill it in */}
        <div aria-hidden='true' className='absolute left-[-9999px] h-0 w-0 overflow-hidden'>
          <label>Website<input tabIndex={-1} autoComplete='off' value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
        </div>
        {status === 'error' && <p role='alert' className='text-sm text-red-600'>{formError}</p>}
        <Button type='submit' disabled={status === 'loading'}>{status === 'loading' ? 'Sending...' : 'Send message'}</Button>
      </form>
    </CardBox>
  )
}
