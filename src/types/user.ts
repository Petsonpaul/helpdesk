import type { Role } from './auth'

export interface UserProfile {
  id: number | string
  first_name: string
  last_name: string
  email: string
  phone?: string | null
  job_title?: string | null
  avatar_url?: string | null
  role: Role
  department?: { id: number | string; name: string } | null
  organization?: { id: number | string; name: string } | null
  email_verified_at?: string | null
}

export interface NotificationPreferences {
  in_app: boolean
  email: boolean
  sound: boolean
  categories: string[]
  quiet_hours: { enabled: boolean; start: string; end: string }
}
