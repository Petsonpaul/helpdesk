import type { Metadata } from 'next'
import NotificationsPage from '@/components/notifications/NotificationsPage'

export const metadata: Metadata = { title: 'Notifications - Qelvoro' }
export default function Page() { return <NotificationsPage /> }
