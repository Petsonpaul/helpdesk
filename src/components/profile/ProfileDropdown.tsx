'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import SimpleBar from 'simplebar-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { profileMenuFor, ROLE_LABEL } from '@/lib/permissions'

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?'
}

export function Avatar({ name, src, size = 35 }: { name: string; src?: string | null; size?: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt='' width={size} height={size} className='rounded-full object-cover' style={{ width: size, height: size }} />
  }
  return (
    <span aria-hidden='true' className='flex items-center justify-center rounded-full bg-primary text-xs font-semibold text-white' style={{ width: size, height: size }}>
      {initials(name)}
    </span>
  )
}

const Profile = () => {
  const { user, logout } = useAuth()
  if (!user) return null
  const items = profileMenuFor(user.role)

  return (
    <div className='relative group/menu ps-15 shrink-0'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            aria-label={`Account menu for ${user.name}`}
            className='hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary'>
            <Avatar name={user.name} src={user.avatar_url} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          collisionPadding={8}
          className='w-screen sm:w-[260px] max-w-[calc(100vw-16px)] pb-4 pt-2 rounded-sm'>
          <div className='flex items-center gap-3 px-4 py-3'>
            <Avatar name={user.name} src={user.avatar_url} size={44} />
            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold'>{user.name}</p>
              <p className='truncate text-xs text-muted-foreground'>{user.email}</p>
              <p className='mt-0.5 text-xs font-medium text-primary'>{ROLE_LABEL[user.role]}</p>
            </div>
          </div>
          <DropdownMenuSeparator className='my-1' />
          <SimpleBar style={{ maxHeight: '50vh' }}>
            {items.map((item) => (
              <DropdownMenuItem key={item.url} asChild>
                <Link
                  href={item.url}
                  className='px-4 py-2 flex justify-between items-center group/link w-full hover:bg-lightprimary hover:text-primary'>
                  <div className='flex items-center gap-3 w-full'>
                    <Icon icon={item.icon} className='text-lg text-muted-foreground group-hover/link:text-primary' />
                    <span className='mb-0 text-sm text-muted-foreground group-hover/link:text-primary'>{item.title}</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </SimpleBar>

          <DropdownMenuSeparator className='my-2' />
          <div className='px-4'>
            <Button variant='outline' className='w-full rounded-md' onClick={() => logout()}>
              Sign Out
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Profile
