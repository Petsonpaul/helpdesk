export type Role = 'super_admin' | 'org_admin' | 'support_manager' | 'technician' | 'employee' | 'customer'

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'grace' | 'expired' | 'cancelled' | 'none'

/**
 * Part of GET /me. Laravel decides `access`; the browser clock is never used to decide whether
 * a trial has expired. `server_time` lets the UI show a countdown that matches the server.
 */
export interface SubscriptionState {
  status: SubscriptionStatus
  plan_name: string | null
  /** ISO 8601 UTC timestamps */
  trial_ends_at: string | null
  current_period_end: string | null
  grace_ends_at: string | null
  /** 'restricted' = paid features are blocked (the server enforces this too); billing stays reachable */
  access: 'full' | 'restricted'
  server_time: string
  /** true only for people allowed to see billing and buy a plan (e.g. the organisation owner) */
  can_manage_billing: boolean
}

/** Shape expected from GET /api/v1/me. The UI uses it for display only; Laravel enforces permissions. */
export interface AuthUser {
  id: number | string
  name: string
  first_name?: string
  last_name?: string
  email: string
  avatar_url?: string | null
  role: Role
  organization?: { id: number | string; name: string; external_support_enabled?: boolean } | null
  /** null/absent for platform staff and roles without an organisation subscription */
  subscription?: SubscriptionState | null
}
