export interface AppNotification {
  id: string
  type: string
  title: string
  body?: string | null
  /** Relative app path (e.g. /tickets/12). The server only sends links the user may open. */
  url?: string | null
  /** urgent notifications ignore quiet hours for sound */
  urgent?: boolean
  read_at: string | null
  created_at: string
}

export type NotificationFilter = 'all' | 'unread' | 'read'
