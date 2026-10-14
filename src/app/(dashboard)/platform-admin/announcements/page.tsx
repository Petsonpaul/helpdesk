'use client'
import ResourcePage from '@/components/shared/ResourcePage'
import { StatusPill } from '@/components/shared/Badges'
import { PLATFORM_ANNOUNCEMENTS, publishAnnouncement, archiveAnnouncement } from '@/services/announcement.service'
import { formatDate } from '@/lib/formatters'
import type { FieldDef } from '@/components/shared/EntityForm'

interface Ann { id: number; title: string; category: string; severity: string; status: string; target_audience: string; publish_at: string | null }

const CATEGORIES = [
  { value: 'general', label: 'General Announcement' }, { value: 'maintenance', label: 'Scheduled Maintenance' },
  { value: 'disruption', label: 'Service Disruption' }, { value: 'security', label: 'Security Notice' },
  { value: 'billing', label: 'Billing Announcement' }, { value: 'product', label: 'Product Update' },
]
const fields: FieldDef[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'body', label: 'Body', type: 'textarea', required: true },
  { name: 'category', label: 'Category', type: 'select', options: CATEGORIES, required: true },
  { name: 'severity', label: 'Severity', type: 'select', required: true, options: [{ value: 'info', label: 'Info' }, { value: 'warning', label: 'Warning' }, { value: 'critical', label: 'Critical' }] },
  { name: 'target_audience', label: 'Audience', type: 'select', required: true, options: [{ value: 'all', label: 'All organisations' }, { value: 'selected', label: 'Selected organisations' }] },
  { name: 'organization_ids', label: 'Selected organisations (when audience is "Selected")', type: 'multicheck', optionsEndpoint: '/options/organizations' },
  { name: 'publish_at', label: 'Publish at (leave empty to publish manually)', type: 'datetime-local' },
  { name: 'starts_at', label: 'Visible from', type: 'datetime-local' },
  { name: 'ends_at', label: 'Visible until', type: 'datetime-local' },
  { name: 'maintenance_start', label: 'Maintenance window start', type: 'datetime-local' },
  { name: 'maintenance_end', label: 'Maintenance window end', type: 'datetime-local' },
  { name: 'requires_acknowledgement', label: 'Require organisations to acknowledge', type: 'checkbox' },
]

export default function Page() {
  return (
    <ResourcePage<Ann>
      title='Announcements'
      crumbs={[{ title: 'Home', to: '/platform-admin' }, { title: 'Announcements' }]}
      endpoint={PLATFORM_ANNOUNCEMENTS}
      filters={[{ key: 'status', label: 'Status', options: [{ value: 'draft', label: 'Draft' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }] }]}
      columns={[
        { key: 'title', header: 'Title' },
        { key: 'category', header: 'Category' },
        { key: 'severity', header: 'Severity' },
        { key: 'target_audience', header: 'Audience' },
        { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} /> },
        { key: 'publish_at', header: 'Publish at', render: (r) => formatDate(r.publish_at, true) },
      ]}
      form={{ noun: 'announcement', fields, createLabel: 'New announcement' }}
      actions={[
        { label: 'Publish', show: (r) => r.status === 'draft' || r.status === 'scheduled', confirm: { title: 'Publish announcement?', body: 'It becomes visible to the selected audience. Publishing does not change any service.', confirmLabel: 'Publish' }, run: (r) => publishAnnouncement(r.id) },
        { label: 'Archive', show: (r) => r.status !== 'archived', confirm: { title: 'Archive announcement?', body: 'It will no longer be shown to organisations.', confirmLabel: 'Archive' }, run: (r) => archiveAnnouncement(r.id) },
      ]}
    />
  )
}
