'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import CardBox from '@/components/shared/CardBox'
import BreadcrumbComp from '@/components/layout/BreadcrumbComp'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/StateViews'
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/notification.service'
import { notificationIcon } from './NotificationDropdown'
import { safeInternalUrl } from '@/lib/permissions'
import { timeAgo } from '@/lib/formatters'
import { mutate as globalMutate } from 'swr'
import type { NotificationFilter } from '@/types/notification'

const FILTERS: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
]

export default function NotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [page, setPage] = useState(1)
  const { data, error, isLoading, mutate } = useSWR(['notifications', filter, page], () => listNotifications(filter, page, 15), { shouldRetryOnError: false })

  const refreshAll = () => { mutate(); globalMutate('notifications-unread'); globalMutate(['notifications', 'recent']) }
  const open = async (id: string, isUnread: boolean, url?: string | null) => {
    if (isUnread) { try { await markNotificationRead(id) } finally { refreshAll() } }
    const safe = safeInternalUrl(url)
    if (safe) router.push(safe)
  }
  const readAll = async () => { try { await markAllNotificationsRead() } finally { refreshAll() } }

  return (
    <>
      <BreadcrumbComp title='Notifications' items={[{ to: '/dashboard', title: 'Home' }, { title: 'Notifications' }]} />
      <CardBox className='p-0'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border p-4'>
          <div role='tablist' aria-label='Filter notifications' className='flex gap-2'>
            {FILTERS.map((f) => (
              <Button key={f.value} role='tab' aria-selected={filter === f.value} size='sm'
                variant={filter === f.value ? 'default' : 'outline'} onClick={() => { setFilter(f.value); setPage(1) }}>
                {f.label}
              </Button>
            ))}
          </div>
          <Button size='sm' variant='outline' onClick={readAll}>Mark all as read</Button>
        </div>

        {isLoading && <LoadingState label='Loading notifications' />}
        {!isLoading && error && <ErrorState message={(error as Error).message} onRetry={() => mutate()} />}
        {!isLoading && !error && data && data.data.length === 0 && <EmptyState title='No notifications here'>Nothing to show for this filter.</EmptyState>}
        {!isLoading && !error && data && data.data.length > 0 && (
          <ul>
            {data.data.map((n) => {
              const isUnread = !n.read_at
              return (
                <li key={n.id} className='border-b border-border last:border-b-0'>
                  <button type='button' onClick={() => open(n.id, isUnread, n.url)}
                    className='flex w-full items-start gap-3 p-4 text-left hover:bg-lightprimary'>
                    <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lightprimary text-primary'>
                      <Icon icon={notificationIcon(n.type)} width='18' />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className={`block break-words text-sm ${isUnread ? 'font-semibold' : ''}`}>
                        {n.title}{isUnread && <span className='sr-only'> (unread)</span>}
                      </span>
                      {n.body && <span className='block break-words text-sm text-muted-foreground'>{n.body}</span>}
                      <span className='mt-1 block text-xs text-muted-foreground'>{timeAgo(n.created_at)}</span>
                    </span>
                    {isUnread && <span aria-hidden='true' className='mt-2 h-2 w-2 shrink-0 rounded-full bg-primary' />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {data && data.meta.last_page > 1 && (
          <div className='flex items-center justify-between gap-3 border-t border-border p-4 text-sm'>
            <Button size='sm' variant='outline' disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span>Page {data.meta.current_page} of {data.meta.last_page}</span>
            <Button size='sm' variant='outline' disabled={page >= data.meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        )}
      </CardBox>
    </>
  )
}
