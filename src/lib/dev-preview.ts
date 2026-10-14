import type { AuthUser, Role, SubscriptionState, SubscriptionStatus } from '@/types/auth'

/**
 * Development-only helper so the UI can be viewed before the Laravel API exists.
 * It is ignored in production builds. The user it creates is NOT real data.
 */
export const DEV_PREVIEW = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEV_PREVIEW === 'true'

function devSubscription(role: Role): SubscriptionState | null {
  const status = process.env.NEXT_PUBLIC_DEV_SUBSCRIPTION as SubscriptionStatus | undefined
  if (!status || status === 'none' || role === 'super_admin') return null
  const now = Date.now()
  const iso = (days: number) => new Date(now + days * 86_400_000).toISOString()
  return {
    status,
    plan_name: status === 'trialing' ? null : 'Dev Plan',
    trial_ends_at: status === 'trialing' ? iso(Number(process.env.NEXT_PUBLIC_DEV_TRIAL_DAYS ?? 9)) : null,
    current_period_end: status === 'active' ? iso(20) : null,
    grace_ends_at: status === 'past_due' || status === 'grace' ? iso(5) : null,
    access: status === 'expired' || status === 'cancelled' ? 'restricted' : 'full',
    server_time: new Date(now).toISOString(),
    can_manage_billing: role === 'org_admin',
  }
}

export function devPreviewUser(): AuthUser {
  const role = (process.env.NEXT_PUBLIC_DEV_ROLE as Role) || 'org_admin'
  return { id: 'dev', name: 'Dev Preview User', email: 'dev-preview@example.invalid', role, organization: { id: 'dev', name: 'Dev Preview Organisation', external_support_enabled: process.env.NEXT_PUBLIC_DEV_PORTAL !== 'disabled' }, subscription: devSubscription(role) }
}
