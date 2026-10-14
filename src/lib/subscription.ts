import type { SubscriptionState } from '@/types/auth'

const DAY = 86_400_000
const HOUR = 3_600_000

/** Difference between the server clock and this browser, measured when /me was fetched. */
export function serverOffsetMs(serverTime: string | undefined, now = Date.now()): number {
  const t = Date.parse(serverTime ?? '')
  return Number.isNaN(t) ? 0 : t - now
}

/** Milliseconds until `endIso`, using server-corrected time. null when there is no usable date. DISPLAY ONLY. */
export function remainingMs(endIso: string | null | undefined, offsetMs: number, now = Date.now()): number | null {
  if (!endIso) return null
  const e = Date.parse(endIso)
  return Number.isNaN(e) ? null : e - (now + offsetMs)
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return 'ending now'
  if (ms < HOUR) return 'less than an hour'
  if (ms < DAY) { const h = Math.floor(ms / HOUR); return `${h} hour${h === 1 ? '' : 's'}` }
  const d = Math.ceil(ms / DAY)
  return `${d} day${d === 1 ? '' : 's'}`
}

export type Banner =
  | { kind: 'trial'; text: string; endsAt: string; urgent: boolean }
  | { kind: 'payment_failed'; graceEndsAt: string | null }
  | null

/** Only people who may manage billing are ever asked to pay. Everyone else sees no purchase prompts. */
export function bannerFor(sub: SubscriptionState | null | undefined, offsetMs: number, now = Date.now()): Banner {
  if (!sub || !sub.can_manage_billing || sub.access === 'restricted') return null
  if (sub.status === 'trialing' && sub.trial_ends_at) {
    const ms = remainingMs(sub.trial_ends_at, offsetMs, now)
    if (ms === null) return null
    return { kind: 'trial', text: formatRemaining(ms), endsAt: sub.trial_ends_at, urgent: ms <= 3 * DAY }
  }
  if (sub.status === 'past_due' || sub.status === 'grace') return { kind: 'payment_failed', graceEndsAt: sub.grace_ends_at }
  return null
}

export const isRestricted = (sub: SubscriptionState | null | undefined) => sub?.access === 'restricted'

/** Pages that stay open when paid features are blocked, so the organisation can fix billing and contact Qelvoro. */
const OPEN_WHEN_RESTRICTED = ['/admin/billing', '/admin/platform-support', '/profile', '/settings', '/notifications']
export function isOpenWhenRestricted(path: string): boolean {
  return OPEN_WHEN_RESTRICTED.some((p) => path === p || path.startsWith(p + '/'))
}

/** The organisation can switch its external customer portal off; the server enforces this too. */
export function isPortalDisabled(user: { role: string; organization?: { external_support_enabled?: boolean } | null } | null | undefined): boolean {
  return user?.role === 'customer' && user.organization?.external_support_enabled === false
}
const OPEN_WHEN_PORTAL_DISABLED = ['/profile', '/settings', '/notifications']
export function isOpenWhenPortalDisabled(path: string): boolean {
  return OPEN_WHEN_PORTAL_DISABLED.some((p) => path === p || path.startsWith(p + '/'))
}
