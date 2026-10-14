import { describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import type { AuthUser, Role } from '@/types/auth'

/** Fresh copy of the demo "server" for every test, so changes made in one test do not leak into another. */
async function load() {
  vi.resetModules()
  const api = await import('@/demo/api')
  const demo = await import('@/lib/demo')
  const req = api.demoRequest
  return { req, ...demo }
}
type Row = Record<string, unknown>
type List = { data: Row[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }

describe('demo mode: sign-in and roles', () => {
  it('needs a role before any private data, but public pages work', async () => {
    const { req, clearDemoRole } = await load()
    clearDemoRole()
    await expect(req('GET', '/me')).rejects.toMatchObject({ status: 401 })
    await expect(req('POST', '/contact', { name: 'a' })).resolves.toBeUndefined()
    await expect(req('GET', '/plans')).rejects.toMatchObject({ status: 404 }) // real plans come from the real API
  })

  it('returns the chosen role, organisation and subscription for /me', async () => {
    const { req, setDemoRole, DEMO_ROLES } = await load()
    for (const role of DEMO_ROLES) {
      setDemoRole(role)
      const { data } = await req<{ data: AuthUser }>('GET', '/me')
      expect(data.role).toBe(role)
      if (role === 'super_admin') expect(data.organization).toBeNull()
      if (role === 'org_admin') expect(data.subscription?.can_manage_billing).toBe(true)
      if (role === 'employee' || role === 'technician') expect(data.subscription?.can_manage_billing).toBe(false)
      if (role === 'customer') expect(data.subscription).toBeNull()
    }
  })

  it('gives every role its own dashboard and refuses the others', async () => {
    const { req, setDemoRole } = await load()
    const names: Record<Role, string> = { super_admin: 'super-admin', org_admin: 'organization', support_manager: 'support-manager', technician: 'technician', employee: 'employee', customer: 'customer' }
    for (const [role, name] of Object.entries(names) as [Role, string][]) {
      setDemoRole(role)
      const d = await req<{ stats: unknown[]; charts: unknown[] }>('GET', `/dashboards/${name}`, undefined, { range_days: 30 })
      expect(d.stats.length).toBeGreaterThan(0)
    }
    setDemoRole('employee')
    await expect(req('GET', '/dashboards/super-admin')).rejects.toMatchObject({ status: 403 })
    await expect(req('GET', '/platform-admin/payments')).rejects.toMatchObject({ status: 403 })
  })
})

describe('demo mode: every list screen is served', () => {
  const lists: [Role, string][] = [
    ['super_admin', '/platform-admin/organizations'], ['super_admin', '/platform-admin/subscriptions'], ['super_admin', '/platform-admin/plans'],
    ['super_admin', '/platform-admin/payments'], ['super_admin', '/platform-admin/settlements'], ['super_admin', '/platform-admin/refunds'],
    ['super_admin', '/platform-admin/audit-logs'], ['super_admin', '/platform-admin/announcements'], ['super_admin', '/platform-admin/support'],
    ['org_admin', '/users'], ['org_admin', '/departments'], ['org_admin', '/teams'], ['org_admin', '/announcements'], ['org_admin', '/platform-support'],
    ['support_manager', '/tickets'], ['technician', '/tickets'], ['employee', '/tickets'], ['customer', '/tickets'], ['employee', '/notifications'],
  ]
  it.each(lists)('%s can load %s as a paginated list', async (role, endpoint) => {
    const { req, setDemoRole } = await load()
    setDemoRole(role)
    const res = await req<List>('GET', endpoint, undefined, { page: 1, per_page: 5 })
    expect(Array.isArray(res.data)).toBe(true)
    expect(res.data.length).toBeGreaterThan(0)
    expect(res.meta).toMatchObject({ current_page: 1 })
  })

  it('supports search, filters and sorting like the real API will', async () => {
    const { req, setDemoRole } = await load()
    setDemoRole('technician')
    const urgent = await req<List>('GET', '/tickets', undefined, { priority: 'urgent' })
    expect(urgent.data.every((t) => t.priority === 'urgent')).toBe(true)
    const unassigned = await req<List>('GET', '/tickets', undefined, { assignee_id: 'unassigned' })
    expect(unassigned.data.every((t) => t.assignee_id === null)).toBe(true)
    const mine = await req<List>('GET', '/tickets', undefined, { assignee_id: 'me' })
    expect(mine.data.length).toBeGreaterThan(0)
    const found = await req<List>('GET', '/tickets', undefined, { search: 'vpn' })
    expect(found.data).toHaveLength(1)
    const sorted = await req<List>('GET', '/tickets', undefined, { sort: 'priority', direction: 'desc', per_page: 3 })
    expect(sorted.data[0].priority).toBe('urgent')
    expect(sorted.meta.per_page).toBe(3)
  })

  it('answers every endpoint literal that the screens ask for', async () => {
    const { req, setDemoRole, DEMO_ROLES } = await load()
    const found = new Set<string>()
    const walk = (dir: string) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) return walk(p)
      if (!/\.tsx?$/.test(e.name) || p.includes(`${path.sep}demo${path.sep}`)) return
      const s = fs.readFileSync(p, 'utf8')
      for (const m of s.matchAll(/(?:endpoint|optionsEndpoint)\s*[=:]\s*['"`](\/[^'"`?${]+)['"`]/g)) found.add(m[1])
      for (const m of s.matchAll(/api\.get(?:<[^(]*?>)?\(\s*['"`](\/[^'"`$?]+)['"`]/g)) found.add(m[1])
    })
    walk(path.resolve(__dirname, '../src'))
    found.delete('/plans')
    expect(found.size).toBeGreaterThan(15)
    const unserved: string[] = []
    for (const ep of found) {
      let served = false
      for (const role of DEMO_ROLES) {
        setDemoRole(role)
        try { await req('GET', ep); served = true } catch (e) { if ((e as { status?: number }).status !== 404) served = true }
        if (served) break
      }
      if (!served) unserved.push(ep)
    }
    expect(unserved).toEqual([])
  })
})

describe('demo mode: tickets behave like the real workflow', () => {
  type Detail = { data: { permissions: Record<string, boolean>; allowed_transitions: string[]; notes?: unknown[]; assignee: string | null; status: string; replies: unknown[]; history: unknown[] } }

  it('lets a technician claim an unassigned ticket once, and refuses a second claim', async () => {
    const { req, setDemoRole } = await load()
    setDemoRole('technician')
    expect((await req<Detail>('GET', '/tickets/7')).data.permissions.can_claim).toBe(true)
    await req('POST', '/tickets/7/claim')
    const after = await req<Detail>('GET', '/tickets/7')
    expect(after.data.assignee).toBe('Tunde Bakare')
    expect(after.data.permissions.can_claim).toBe(false)
    await expect(req('POST', '/tickets/7/claim')).rejects.toMatchObject({ status: 409 })
  })

  it('only allows valid status changes and records them in the history', async () => {
    const { req, setDemoRole } = await load()
    setDemoRole('support_manager')
    await expect(req('POST', '/tickets/8/status', { status: 'closed' })).rejects.toMatchObject({ status: 422 })
    const before = (await req<Detail>('GET', '/tickets/8')).data.history.length
    await req('POST', '/tickets/8/status', { status: 'in_progress' })
    const after = await req<Detail>('GET', '/tickets/8')
    expect(after.data.status).toBe('in_progress')
    expect(after.data.history.length).toBe(before + 1)
  })

  it('keeps internal notes away from requesters and other people\'s tickets private', async () => {
    const { req, setDemoRole } = await load()
    setDemoRole('technician')
    expect((await req<Detail>('GET', '/tickets/6')).data.notes?.length).toBeGreaterThan(0)
    setDemoRole('employee') // Amina Yusuf
    const own = await req<Detail>('GET', '/tickets/4')
    expect('notes' in own.data).toBe(false)
    expect(own.data.permissions.can_add_note).toBe(false)
    await expect(req('GET', '/tickets/1')).rejects.toMatchObject({ status: 404 }) // John Doe's ticket
    const list = await req<List>('GET', '/tickets')
    expect(list.data.every((t) => t.requester === 'Amina Yusuf')).toBe(true)
  })

  it('creates a ticket for the signed-in person and validates the subject', async () => {
    const { req, setDemoRole } = await load()
    setDemoRole('employee')
    await expect(req('POST', '/tickets', { subject: 'x', description: 'too short' })).rejects.toMatchObject({ status: 422 })
    const before = (await req<List>('GET', '/tickets')).meta.total
    const form = new FormData(); form.append('subject', 'Keyboard keys stuck'); form.append('description', 'Several keys do not respond.'); form.append('category_id', '1')
    const created = await req<{ data: { id: number } }>('POST', '/tickets', form)
    expect((await req<List>('GET', '/tickets')).meta.total).toBe(before + 1)
    expect((await req<Detail>('GET', `/tickets/${created.data.id}`)).data.status).toBe('new')
  })
})

describe('demo mode: other screens', () => {
  it('marks notifications read', async () => {
    const { req, setDemoRole } = await load()
    setDemoRole('org_admin')
    expect((await req<{ count: number }>('GET', '/notifications/unread-count')).count).toBeGreaterThan(0)
    await req('POST', '/notifications/read-all')
    expect((await req<{ count: number }>('GET', '/notifications/unread-count')).count).toBe(0)
  })

  it('never shows invented prices, and refuses checkout', async () => {
    const { req, setDemoRole } = await load()
    setDemoRole('org_admin')
    const b = await req<{ data: { plans: { price_monthly: number | null }[] } }>('GET', '/organization/billing')
    expect(b.data.plans.every((p) => p.price_monthly === null)).toBe(true)
    await expect(req('POST', '/billing/checkout', { plan_id: '1' })).rejects.toMatchObject({ status: 400 })
  })

  it('lets an admin add a department and rejects an empty name', async () => {
    const { req, setDemoRole } = await load()
    setDemoRole('org_admin')
    await expect(req('POST', '/departments', { name: ' ' })).rejects.toMatchObject({ status: 422 })
    await req('POST', '/departments', { name: 'Legal', description: 'Contracts' })
    const res = await req<List>('GET', '/departments', undefined, { search: 'legal' })
    expect(res.data).toHaveLength(1)
  })

  it('marks estimates as estimates on the revenue page', async () => {
    const { req, setDemoRole } = await load()
    setDemoRole('super_admin')
    const r = await req<{ stats: { key: string; hint?: string }[]; charts: { estimated?: boolean }[] }>('GET', '/platform-admin/revenue')
    expect(r.stats.find((s) => s.key === 'net')?.hint).toMatch(/estimate/i)
    expect(r.charts.some((c) => c.estimated)).toBe(true)
  })
})
