'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications } from '@/hooks/use-notifications'
import { safeInternalUrl } from '@/lib/permissions'
import { timeAgo } from '@/lib/formatters'

export function notificationIcon(type: string) {
  if (type.includes('ticket')) return 'tabler:ticket'
  if (type.includes('payment') || type.includes('subscription')) return 'tabler:credit-card'
  if (type.includes('announcement')) return 'tabler:speakerphone'
  return 'tabler:bell'
}

const Notifications = () => {
  const router = useRouter()
  const { items, unread, loading, error, markRead, markAll, refresh, soundEnabled, soundAvailable, toggleSound } = useNotifications()
  const label = unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'

  return (
    <div className='relative group/menu px-15'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type='button' aria-label={label} className='relative'>
            <span className='relative after:absolute after:w-10 after:h-10 after:rounded-full text-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary after:-top-1/2 hover:after:bg-lightprimary dark:hover:after:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:after:bg-lightprimary group-hover/menu:text-primary'>
              <Icon icon='tabler:bell-ringing' height={20} />
            </span>
            {unread > 0 && (
              <span className='rounded-full absolute -end-[6px] -top-[5px] text-[10px] h-2 w-2 bg-primary flex justify-center items-center' />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          collisionPadding={8}
          className='w-screen sm:w-[320px] max-w-[calc(100vw-16px)] py-6 rounded-sm border border-border'>
          <div className='flex items-center px-6 justify-between gap-2'>
            <h3 className='mb-0 text-lg font-semibold'>Notification</h3>
            <div className='flex items-center gap-2'>
              {unread > 0 && <Badge color={'primary'}>{unread > 99 ? '99+' : unread} new</Badge>}
              <button type='button' onClick={() => toggleSound()} disabled={!soundAvailable} aria-pressed={soundEnabled}
                aria-label={soundEnabled ? 'Turn notification sound off' : 'Turn notification sound on'}
                title={soundEnabled ? 'Sound on (plays only while this page is open)' : 'Sound off'}
                className='flex h-8 w-8 items-center justify-center rounded-full hover:bg-lightprimary hover:text-primary disabled:opacity-40'>
                <Icon icon={soundEnabled ? 'tabler:volume' : 'tabler:volume-off'} width='18' aria-hidden='true' />
              </button>
            </div>
          </div>
          {unread > 0 && (
            <div className='px-6 pt-1'>
              <button type='button' onClick={() => markAll()} className='text-xs font-medium text-primary hover:underline'>
                Mark all as read
              </button>
            </div>
          )}

          <SimpleBar className='max-h-80 mt-3'>
            {loading && (
              <div className='space-y-3 px-6 py-2' aria-busy='true'>
                {[0, 1, 2].map((i) => <Skeleton key={i} className='h-10 w-full' />)}
              </div>
            )}
            {!loading && error && (
              <div role='alert' className='px-6 py-4 text-sm'>
                <p className='text-muted-foreground'>Notifications could not be loaded.</p>
                <button type='button' onClick={refresh} className='mt-2 text-xs font-medium text-primary hover:underline'>Try again</button>
              </div>
            )}
            {!loading && !error && items.length === 0 && (
              <p className='px-6 py-6 text-center text-sm text-muted-foreground'>You have no notifications.</p>
            )}
            {!loading && !error && items.map((n) => {
              const isUnread = !n.read_at
              const url = safeInternalUrl(n.url)
              return (
                <DropdownMenuItem
                  key={n.id}
                  className='px-6 py-3 flex items-start gap-3 bg-hover group/link w-full cursor-pointer'
                  onSelect={() => { if (isUnread) markRead(n.id); if (url) router.push(url) }}>
                  <span className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lightprimary text-primary'>
                    <Icon icon={notificationIcon(n.type)} width='18' />
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className={`mb-0.5 block break-words text-sm group-hover/link:text-primary ${isUnread ? 'font-semibold' : ''}`}>
                      {n.title}{isUnread && <span className='sr-only'> (unread)</span>}
                    </span>
                    {n.body && <span className='block line-clamp-2 break-words text-xs text-muted-foreground'>{n.body}</span>}
                    <span className='mt-0.5 block text-[11px] text-muted-foreground'>{timeAgo(n.created_at)}</span>
                  </span>
                  {isUnread && <span aria-hidden='true' className='mt-2 h-2 w-2 shrink-0 rounded-full bg-primary' />}
                </DropdownMenuItem>
              )
            })}
          </SimpleBar>
          <div className='pt-5 px-6'>
            <Button variant={'outline'} className='w-full' asChild>
              <Link href='/notifications'>View all notifications</Link>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Notifications
