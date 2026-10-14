'use client'
import ResourcePage from '@/components/shared/ResourcePage'
import { Badge } from '@/components/ui/badge'
import { acknowledgeAnnouncement, markAnnouncementRead } from '@/services/announcement.service'
import { formatDate } from '@/lib/formatters'
import type { AnnouncementItem } from '@/types/api'

export default function Page() {
  return (
    <ResourcePage<AnnouncementItem>
      title='Announcements'
      crumbs={[{ title: 'Home', to: '/admin' }, { title: 'Announcements' }]}
      endpoint='/announcements'
      searchable={false}
      columns={[
        { key: 'title', header: 'Title', render: (r) => <span className={r.read ? '' : 'font-semibold'}>{r.title}{!r.read && <span className='sr-only'> (unread)</span>}</span> },
        { key: 'category', header: 'Category' },
        { key: 'severity', header: 'Severity' },
        { key: 'published_at', header: 'Published', render: (r) => formatDate(r.published_at, true) },
        { key: 'maintenance_start', header: 'Maintenance', render: (r) => (r.maintenance_start ? `${formatDate(r.maintenance_start, true)} to ${formatDate(r.maintenance_end, true)}` : '—') },
        { key: 'acknowledged', header: 'State', render: (r) => (r.acknowledged ? <Badge variant='lightSuccess'>Acknowledged</Badge> : r.read ? <Badge variant='gray'>Read</Badge> : <Badge variant='lightPrimary'>New</Badge>) },
      ]}
      actions={[
        { label: 'Mark as read', show: (r) => !r.read, run: (r) => markAnnouncementRead(r.id) },
        { label: 'Acknowledge', show: (r) => r.requires_acknowledgement && !r.acknowledged, run: (r) => acknowledgeAnnouncement(r.id) },
      ]}
    />
  )
}
