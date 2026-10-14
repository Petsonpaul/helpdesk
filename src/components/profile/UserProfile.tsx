'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import BreadcrumbComp from '@/components/layout/BreadcrumbComp'
import CardBox from '@/components/shared/CardBox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ErrorState, LoadingState } from '@/components/shared/StateViews'
import EntityForm from '@/components/shared/EntityForm'
import { Avatar } from './ProfileDropdown'
import { useProfile } from '@/hooks/use-profile'
import { useAuth } from '@/hooks/use-auth'
import { ROLE_LABEL } from '@/lib/permissions'
import { formatDate } from '@/lib/formatters'
import { updateProfile, uploadAvatar } from '@/services/profile.service'

const MAX_AVATAR_MB = 2
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function UserProfile() {
  const { profile, error, loading, refresh } = useProfile()
  const { refresh: refreshAuth } = useAuth()
  const [editing, setEditing] = useState(false)
  const [avatarMsg, setAvatarMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function onAvatar(file?: File) {
    if (!file || uploading) return
    if (!AVATAR_TYPES.includes(file.type)) return setAvatarMsg({ ok: false, text: 'Please choose a JPG, PNG or WebP image.' })
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) return setAvatarMsg({ ok: false, text: `The image must be smaller than ${MAX_AVATAR_MB} MB.` })
    setUploading(true); setAvatarMsg(null)
    try { await uploadAvatar(file); await Promise.all([refresh(), refreshAuth()]); setAvatarMsg({ ok: true, text: 'Profile picture updated.' }) }
    catch (e) { setAvatarMsg({ ok: false, text: e instanceof Error ? e.message : 'Upload failed.' }) }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }

  return (
    <>
      <BreadcrumbComp title='My profile' items={[{ title: 'Home', to: '/dashboard' }, { title: 'Profile' }]} />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} onRetry={() => refresh()} />}
      {profile && (
        <div className='space-y-6'>
          <CardBox className='p-6'>
            <div className='flex flex-wrap items-center gap-5'>
              <Avatar name={`${profile.first_name} ${profile.last_name}`} src={profile.avatar_url} size={88} />
              <div className='min-w-0 flex-1'>
                <h2 className='break-words text-xl font-semibold'>{profile.first_name} {profile.last_name}</h2>
                <p className='text-sm text-muted-foreground'>{profile.job_title || 'No job title set'}{profile.organization ? ` · ${profile.organization.name}` : ''}</p>
                <Badge variant='lightPrimary' className='mt-2'>{ROLE_LABEL[profile.role]}</Badge>
              </div>
              <div>
                <input ref={fileRef} id='avatar-input' type='file' accept={AVATAR_TYPES.join(',')} className='sr-only' onChange={(e) => onAvatar(e.target.files?.[0])} />
                <Button variant='outline' disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? 'Uploading...' : 'Change picture'}</Button>
              </div>
            </div>
            {avatarMsg && <p role={avatarMsg.ok ? 'status' : 'alert'} className={`mt-3 text-sm ${avatarMsg.ok ? 'text-green-600' : 'text-red-600'}`}>{avatarMsg.text}</p>}
          </CardBox>

          <CardBox className='p-6'>
            <div className='mb-4 flex items-center justify-between gap-3'>
              <h3 className='text-base font-semibold'>Personal information</h3>
              <Button variant='outline' onClick={() => setEditing(true)}>Edit</Button>
            </div>
            <dl className='grid gap-4 sm:grid-cols-2'>
              {([['First name', profile.first_name], ['Last name', profile.last_name], ['Email address', profile.email], ['Phone', profile.phone], ['Job title', profile.job_title], ['Department', profile.department?.name], ['Organisation', profile.organization?.name]] as [string, string | null | undefined][])
                .map(([k, v]) => <div key={k}><dt className='text-xs text-muted-foreground'>{k}</dt><dd className='break-words text-sm font-medium'>{v || '—'}</dd></div>)}
            </dl>
          </CardBox>

          <CardBox className='p-6'>
            <h3 className='mb-4 text-base font-semibold'>Account security</h3>
            <p className='text-sm'>
              Email: {profile.email_verified_at ? <>verified on {formatDate(profile.email_verified_at)}</> : <>not verified. <Link href='/verify-email' className='font-medium text-primary'>Verify now</Link></>}
            </p>
            <p className='mt-3 flex flex-wrap gap-4 text-sm'>
              <Link href='/settings?tab=security' className='font-medium text-primary'>Change password</Link>
              <Link href='/settings?tab=notifications' className='font-medium text-primary'>Notification preferences</Link>
            </p>
          </CardBox>
        </div>
      )}

      {profile && (
        <EntityForm
          open={editing}
          onOpenChange={setEditing}
          title='Edit profile'
          description='Changing your email may require you to verify the new address.'
          fields={[
            { name: 'first_name', label: 'First name', required: true },
            { name: 'last_name', label: 'Last name', required: true },
            { name: 'email', label: 'Email address', type: 'email', required: true },
            { name: 'phone', label: 'Phone number' },
            { name: 'job_title', label: 'Job title' },
          ]}
          initial={{ first_name: profile.first_name, last_name: profile.last_name, email: profile.email, phone: profile.phone ?? '', job_title: profile.job_title ?? '' }}
          onSubmit={async (v) => {
            await updateProfile({ first_name: String(v.first_name), last_name: String(v.last_name), email: String(v.email), phone: String(v.phone ?? ''), job_title: String(v.job_title ?? '') })
            await Promise.all([refresh(), refreshAuth()])
          }}
        />
      )}
    </>
  )
}
