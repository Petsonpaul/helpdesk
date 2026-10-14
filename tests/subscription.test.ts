import { describe, expect, it } from 'vitest'
import { bannerFor, formatRemaining, isOpenWhenRestricted, isRestricted, remainingMs, serverOffsetMs } from '@/lib/subscription'
import type { SubscriptionState } from '@/types/auth'

const NOW = Date.parse('2026-10-12T10:00:00Z')
const iso = (offsetMs: number) => new Date(NOW + offsetMs).toISOString()
const DAY = 86_400_000
const base = (over: Partial<SubscriptionState> = {}): SubscriptionState => ({
  status: 'trialing', plan_name: null, trial_ends_at: iso(9 * DAY), current_period_end: null, grace_ends_at: null,
  access: 'full', server_time: iso(0), can_manage_billing: true, ...over,
})

describe('server-corrected time', () => {
  it('uses the server clock, not the browser clock, for the countdown', () => {
    // browser clock is 2 hours behind the server
    const offset = serverOffsetMs(iso(0), NOW - 2 * 3_600_000)
    expect(offset).toBe(2 * 3_600_000)
    expect(remainingMs(iso(5 * DAY), offset, NOW - 2 * 3_600_000)).toBe(5 * DAY)
  })
  it('returns null for missing or invalid dates', () => {
    expect(remainingMs(null, 0, NOW)).toBeNull()
    expect(remainingMs('nonsense', 0, NOW)).toBeNull()
    expect(serverOffsetMs(undefined, NOW)).toBe(0)
  })
})

describe('formatRemaining', () => {
  it('formats days, hours and the final moments', () => {
    expect(formatRemaining(9 * DAY - 1000)).toBe('9 days')
    expect(formatRemaining(DAY)).toBe('1 day')
    expect(formatRemaining(5 * 3_600_000)).toBe('5 hours')
    expect(formatRemaining(60_000)).toBe('less than an hour')
    expect(formatRemaining(0)).toBe('ending now')
  })
})

describe('bannerFor', () => {
  it('shows a calm trial banner to billing managers', () => {
    expect(bannerFor(base(), 0, NOW)).toMatchObject({ kind: 'trial', urgent: false, text: '9 days' })
  })
  it('turns urgent in the last 3 days', () => {
    expect(bannerFor(base({ trial_ends_at: iso(2 * DAY) }), 0, NOW)).toMatchObject({ kind: 'trial', urgent: true })
  })
  it('never prompts people who cannot manage billing', () => {
    expect(bannerFor(base({ can_manage_billing: false }), 0, NOW)).toBeNull()
    expect(bannerFor(base({ status: 'past_due', can_manage_billing: false }), 0, NOW)).toBeNull()
  })
  it('shows a payment-problem banner for failed renewals', () => {
    expect(bannerFor(base({ status: 'grace', trial_ends_at: null, grace_ends_at: iso(3 * DAY) }), 0, NOW)).toMatchObject({ kind: 'payment_failed' })
  })
  it('shows nothing when active, restricted, or absent', () => {
    expect(bannerFor(base({ status: 'active', trial_ends_at: null }), 0, NOW)).toBeNull()
    expect(bannerFor(base({ status: 'expired', access: 'restricted' }), 0, NOW)).toBeNull()
    expect(bannerFor(null, 0, NOW)).toBeNull()
  })
})

describe('restriction', () => {
  it('trusts only the server access value', () => {
    expect(isRestricted(base({ access: 'restricted' }))).toBe(true)
    // a trial whose date has passed locally is still NOT restricted unless the server says so
    expect(isRestricted(base({ trial_ends_at: iso(-DAY) }))).toBe(false)
    expect(isRestricted(null)).toBe(false)
  })
  it('keeps billing, platform support, profile, settings and notifications open', () => {
    for (const p of ['/admin/billing', '/admin/platform-support', '/profile', '/settings', '/notifications']) expect(isOpenWhenRestricted(p)).toBe(true)
    for (const p of ['/tickets', '/admin/users', '/reports', '/admin']) expect(isOpenWhenRestricted(p)).toBe(false)
  })
})

import { isOpenWhenPortalDisabled, isPortalDisabled } from '@/lib/subscription'
import { buildSidebar } from '@/lib/permissions'

describe('customer portal switch', () => {
  it('only blocks customers of organisations that turned the portal off', () => {
    expect(isPortalDisabled({ role: 'customer', organization: { external_support_enabled: false } })).toBe(true)
    expect(isPortalDisabled({ role: 'customer', organization: { external_support_enabled: true } })).toBe(false)
    expect(isPortalDisabled({ role: 'customer', organization: {} })).toBe(false) // unknown is not "off"; the server still enforces
    expect(isPortalDisabled({ role: 'employee', organization: { external_support_enabled: false } })).toBe(false)
    expect(isPortalDisabled(null)).toBe(false)
  })
  it('keeps profile, settings and notifications open', () => {
    expect(isOpenWhenPortalDisabled('/profile')).toBe(true)
    expect(isOpenWhenPortalDisabled('/tickets')).toBe(false)
  })
})

describe('unassigned-ticket shortcut', () => {
  it('appears for support staff only', () => {
    const urls = (r: Parameters<typeof buildSidebar>[0]) => buildSidebar(r)[0].children.map((c) => c.url)
    for (const r of ['technician', 'support_manager', 'org_admin'] as const) expect(urls(r)).toContain('/tickets?view=unassigned')
    for (const r of ['employee', 'customer', 'super_admin'] as const) expect(urls(r)).not.toContain('/tickets?view=unassigned')
  })
})
