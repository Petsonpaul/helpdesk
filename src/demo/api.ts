import { ApiError } from '@/lib/api-error'
import { clearDemoRole, getDemoRole } from '@/lib/demo'
import { ROLE_LABEL } from '@/lib/permissions'
import type { AuthUser, Role, SubscriptionState } from '@/types/auth'
import type { ChartDef, FeedItem, MetricsPayload, Stat } from '@/types/api'
import { STATUS_LABEL, type TicketStatus } from '@/types/ticket'
import * as seed from './seed'

/**
 * Demo mode "server": answers the same requests the real API will, using SAMPLE data held in memory.
 * Changes made in the demo last until the page is reloaded. Nothing is sent anywhere.
 */
type Q = Record<string, string | number | undefined>
type Body = Record<string, unknown>
interface Ctx { role: Role; me: seed.Person; params: Record<string, string>; query: Q; body: Body }
type Handler = (c: Ctx) => unknown

const DELAY = process.env.NODE_ENV === 'test' ? 0 : 120 // a little delay so loading states are visible
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
function fail(status: number, message: string, errors: Record<string, string[]> = {}): never { throw new ApiError(status, message, errors) }
const str = (v: unknown) => (v === undefined || v === null ? '' : String(v))
const numOrNull = (v: unknown) => (v === '' || v === undefined || v === null ? null : Number(v))
const money = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n)
const staffRoles: Role[] = ['org_admin', 'support_manager', 'technician']

// ---------- list helpers ----------
const RESERVED = new Set(['page', 'per_page', 'search', 'sort', 'direction'])
function listOf<T extends object>(rows: T[], q: Q, o: { search?: string[]; filters?: Record<string, (r: T, v: string) => boolean>; rank?: Record<string, Record<string, number>> } = {}) {
  let r = rows
  const s = str(q.search).toLowerCase()
  if (s) r = r.filter((x) => (o.search ?? Object.keys(x)).some((k) => str((x as Record<string, unknown>)[k]).toLowerCase().includes(s)))
  for (const [k, v] of Object.entries(q)) {
    if (RESERVED.has(k) || v === undefined || v === '') continue
    const f = o.filters?.[k]
    if (f) r = r.filter((x) => f(x, String(v)))
    else if (rows.length && k in (rows[0] as object)) r = r.filter((x) => str((x as Record<string, unknown>)[k]) === String(v))
  }
  if (q.sort) {
    const k = String(q.sort); const dir = q.direction === 'desc' ? -1 : 1; const rank = o.rank?.[k]
    r = [...r].sort((a, b) => {
      const av = (a as Record<string, unknown>)[k]; const bv = (b as Record<string, unknown>)[k]
      if (rank) return ((rank[str(av)] ?? 0) - (rank[str(bv)] ?? 0)) * dir
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return str(av).localeCompare(str(bv)) * dir
    })
  }
  const per = Math.max(1, Number(q.per_page) || 15)
  const last = Math.max(1, Math.ceil(r.length / per))
  const cur = Math.min(Math.max(1, Number(q.page) || 1), last)
  return { data: r.slice((cur - 1) * per, cur * per), meta: { current_page: cur, last_page: last, per_page: per, total: r.length } }
}
const nextId = (rows: { id: number }[]) => rows.reduce((m, r) => Math.max(m, r.id), 0) + 1
const nameOf = (id: number | null) => seed.people.find((p) => p.id === id)?.name ?? null

// ---------- users / profile ----------
function subscriptionFor(role: Role): SubscriptionState | null {
  if (role === 'super_admin' || role === 'customer') return null
  return { status: 'trialing', plan_name: null, trial_ends_at: seed.orgs[0].trial_ends_at, current_period_end: null, grace_ends_at: null, access: 'full', server_time: new Date().toISOString(), can_manage_billing: role === 'org_admin' }
}
function userFor(role: Role): AuthUser {
  const p = seed.people.find((x) => x.id === seed.ME_BY_ROLE[role])!
  const [first, ...rest] = p.name.split(' ')
  return {
    id: p.id, name: p.name, first_name: first, last_name: rest.join(' '), email: p.email, avatar_url: null, role,
    organization: role === 'super_admin' ? null : { id: 1, name: seed.ORG_NAME, external_support_enabled: seed.orgSettings.external_support_enabled },
    subscription: subscriptionFor(role),
  }
}
const userRow = (p: seed.Person) => ({
  id: p.id, name: p.name, email: p.email, role: p.role, is_active: p.active, can_manage: p.role !== 'org_admin',
  department: seed.departments.find((d) => d.id === p.dept)?.name ?? null, team: seed.teams.find((t) => t.id === p.team)?.name ?? null,
  department_id: p.dept, team_id: p.team,
})
const orgPeople = () => seed.people.filter((p) => p.role !== 'super_admin')

// ---------- tickets ----------
const TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  new: ['open', 'in_progress'], open: ['in_progress', 'pending_requester', 'resolved', 'escalated'],
  in_progress: ['pending_requester', 'resolved', 'escalated'], pending_requester: ['in_progress', 'resolved'],
  escalated: ['in_progress', 'resolved'], resolved: ['closed', 'open'], closed: [],
}
const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Other']
const ref = (id: number) => `TCK-${String(id).padStart(4, '0')}`
const isDone = (s: TicketStatus) => s === 'resolved' || s === 'closed'
function summary(t: seed.Ticket) {
  return {
    id: t.id, reference: ref(t.id), subject: t.subject, status: t.status, priority: t.priority, requester: nameOf(t.requester),
    department: seed.departments.find((d) => d.id === t.dept)?.name ?? null, team: seed.teams.find((x) => x.id === t.team)?.name ?? null, assignee: nameOf(t.assignee),
    department_id: t.dept, team_id: t.team, assignee_id: t.assignee, created_at: t.created, updated_at: t.updated, due_at: t.due,
  }
}
const visibleTickets = (c: Ctx) => {
  if (c.role === 'super_admin') fail(403, 'Platform staff cannot read organisation tickets.')
  return c.role === 'employee' || c.role === 'customer' ? seed.tickets.filter((t) => t.requester === c.me.id) : seed.tickets
}
function findTicket(c: Ctx): seed.Ticket {
  const t = visibleTickets(c).find((x) => x.id === Number(c.params.id))
  return t ?? fail(404, 'Ticket not found.')
}
const touch = (t: seed.Ticket, text?: string) => { t.updated = new Date().toISOString(); if (text) t.history.push({ id: `h${t.id}-${t.history.length + 1}`, text, created_at: t.updated }) }
function ticketDetail(t: seed.Ticket, c: Ctx) {
  const staff = staffRoles.includes(c.role)
  return {
    ...summary(t), description: t.description, category: t.category, attachments: [], replies: t.replies, ...(staff ? { notes: t.notes } : {}),
    history: t.history, allowed_transitions: TRANSITIONS[t.status],
    permissions: {
      can_reply: t.status !== 'closed', can_add_note: staff, can_assign: staff, can_claim: c.role === 'technician' && t.assignee === null,
      can_acknowledge: c.role === 'technician' && t.assignee === c.me.id && t.status === 'new', can_escalate: staff && t.status !== 'escalated' && t.status !== 'closed',
      can_change_status: staff,
    },
  }
}
const ticketFilters = (me: seed.Person) => ({
  assignee_id: (r: ReturnType<typeof summary>, v: string) => (v === 'unassigned' ? r.assignee_id === null : v === 'me' ? r.assignee_id === me.id : String(r.assignee_id) === v),
})

// ---------- dashboards ----------
const pts = (r: number) => (r <= 7 ? { n: 7, step: 1 } : r <= 30 ? { n: 10, step: 3 } : r <= 90 ? { n: 12, step: 7 } : { n: 12, step: 30 })
const line = (key: string, title: string, categories: string[], s: { name: string; data: number[] }[], type: ChartDef['type'] = 'line', estimated?: boolean): ChartDef => ({ key, title, type, categories, series: s, estimated })
const donut = (key: string, title: string, labels: string[], data: number[]): ChartDef => ({ key, title, type: 'donut', labels, series: [{ name: title, data }] })
const bar = (key: string, title: string, categories: string[], data: number[]): ChartDef => ({ key, title, type: 'bar', categories, series: [{ name: 'Tickets', data }] })
const stat = (key: string, label: string, value: number | string, extra: Partial<Stat> = {}): Stat => ({ key, label, value, ...extra })
const feed = (ts: seed.Ticket[]): FeedItem[] => [...ts].sort((a, b) => Date.parse(b.updated) - Date.parse(a.updated)).slice(0, 6)
  .map((t) => ({ id: String(t.id), text: `${ref(t.id)}: ${t.subject} (${STATUS_LABEL[t.status]})`, time: t.updated, url: `/tickets/${t.id}` }))
function statusDonut(ts: seed.Ticket[]) {
  const keys = Object.keys(STATUS_LABEL) as TicketStatus[]
  const used = keys.filter((k) => ts.some((t) => t.status === k))
  return donut('by_status', 'Tickets by status', used.map((k) => STATUS_LABEL[k]), used.map((k) => ts.filter((t) => t.status === k).length))
}
function orgCharts(ts: seed.Ticket[], r: number): ChartDef[] {
  const { n, step } = pts(r)
  const prio = ['low', 'normal', 'high', 'urgent']
  return [
    line('created_resolved', 'Tickets created and resolved', seed.dayLabels(n, step), [{ name: 'Created', data: seed.series(11, n, 4, 9) }, { name: 'Resolved', data: seed.series(23, n, 3, 8) }]),
    statusDonut(ts),
    bar('by_priority', 'Tickets by priority', ['Low', 'Normal', 'High', 'Urgent'], prio.map((p) => ts.filter((t) => t.priority === p).length)),
    donut('by_department', 'Tickets by department', seed.departments.map((d) => d.name), seed.departments.map((d) => ts.filter((t) => t.dept === d.id).length)),
    bar('by_team', 'Tickets by support team', seed.teams.map((t) => t.name), seed.teams.map((x) => ts.filter((t) => t.team === x.id).length)),
  ]
}
function metrics(role: Role, c: Ctx, r: number): MetricsPayload {
  const { n, step } = pts(r)
  const all = seed.tickets
  const now = Date.now()
  const overdue = all.filter((t) => t.due && Date.parse(t.due) < now && !isDone(t.status)).length
  const mineAssigned = all.filter((t) => t.assignee === c.me.id)
  const mineOwn = all.filter((t) => t.requester === c.me.id)
  const ann = seed.orgAnnouncements.filter((a) => a.id !== 3).map((a) => ({ ...a, id: String(a.id) }))
  switch (role) {
    case 'org_admin': return {
      stats: [
        stat('total', 'Total tickets', all.length), stat('open', 'Open tickets', all.filter((t) => t.status === 'new' || t.status === 'open').length),
        stat('progress', 'In progress', all.filter((t) => t.status === 'in_progress').length), stat('resolved', 'Resolved', all.filter((t) => isDone(t.status)).length),
        stat('overdue', 'Overdue', overdue), stat('urgent', 'Urgent', all.filter((t) => t.priority === 'urgent' && !isDone(t.status)).length, { href: '/tickets?view=urgent' }),
        stat('unassigned', 'Unassigned', all.filter((t) => t.assignee === null).length, { href: '/tickets?view=unassigned' }), stat('avg', 'Average resolution time', '5.2 hours', { hint: 'Sample figure' }),
      ], charts: orgCharts(all, r), recent: feed(all), announcements: ann.map((a) => ({ ...a, published_at: a.published_at })),
    }
    case 'support_manager': return {
      stats: [
        stat('new', 'New tickets', all.filter((t) => t.status === 'new').length), stat('open', 'Open', all.filter((t) => t.status === 'open').length),
        stat('progress', 'In progress', all.filter((t) => t.status === 'in_progress').length), stat('unassigned', 'Unassigned', all.filter((t) => t.assignee === null).length, { href: '/tickets?view=unassigned' }),
        stat('urgent', 'Urgent', all.filter((t) => t.priority === 'urgent' && !isDone(t.status)).length, { href: '/tickets?view=urgent' }), stat('overdue', 'Overdue', overdue),
        stat('escalated', 'Escalated', all.filter((t) => t.status === 'escalated').length, { href: '/tickets?view=escalated' }),
      ],
      charts: [
        line('created_resolved', 'Created versus resolved', seed.dayLabels(n, step), [{ name: 'Created', data: seed.series(5, n, 4, 9) }, { name: 'Resolved', data: seed.series(9, n, 3, 8) }]),
        bar('team_load', 'Team workload (open tickets)', seed.teams.map((t) => t.name), seed.teams.map((x) => all.filter((t) => t.team === x.id && !isDone(t.status)).length)),
        bar('tech_load', 'Technician workload (open tickets)', seed.people.filter((p) => p.role === 'technician').map((p) => p.name), seed.people.filter((p) => p.role === 'technician').map((p) => all.filter((t) => t.assignee === p.id && !isDone(t.status)).length)),
        line('backlog', 'Backlog trend', seed.dayLabels(n, step), [{ name: 'Open tickets', data: seed.series(31, n, 6, 8) }], 'area'),
      ], recent: feed(all),
    }
    case 'technician': return {
      stats: [
        stat('mine', 'Assigned to me', mineAssigned.length, { href: '/tickets?view=mine' }), stat('unack', 'Unacknowledged', mineAssigned.filter((t) => t.status === 'new').length),
        stat('urgent', 'Urgent', mineAssigned.filter((t) => t.priority === 'urgent' && !isDone(t.status)).length, { href: '/tickets?view=urgent' }),
        stat('progress', 'In progress', mineAssigned.filter((t) => t.status === 'in_progress').length), stat('resolved', 'Resolved', mineAssigned.filter((t) => isDone(t.status)).length),
        stat('queue', 'Unassigned in the queue', all.filter((t) => t.assignee === null).length, { href: '/tickets?view=unassigned' }),
      ],
      charts: [statusDonut(mineAssigned), line('trend', 'My resolutions', seed.dayLabels(n, step), [{ name: 'Resolved', data: seed.series(41, n, 1, 5) }]), bar('weekly', 'Weekly activity', seed.dayLabels(7, 1), seed.series(7, 7, 1, 6))],
      recent: feed(mineAssigned),
    }
    case 'employee': return {
      stats: [
        stat('open', 'My open tickets', mineOwn.filter((t) => t.status === 'new' || t.status === 'open' || t.status === 'pending_requester').length),
        stat('progress', 'In progress', mineOwn.filter((t) => t.status === 'in_progress').length), stat('resolved', 'Resolved', mineOwn.filter((t) => isDone(t.status)).length),
      ], charts: [statusDonut(mineOwn)], recent: feed(mineOwn), announcements: ann,
    }
    case 'customer': return {
      stats: [stat('open', 'Open requests', mineOwn.filter((t) => !isDone(t.status)).length), stat('resolved', 'Resolved requests', mineOwn.filter((t) => isDone(t.status)).length)],
      charts: [], recent: feed(mineOwn),
    }
    default: { // super_admin
      const live = seed.orgs
      const cum = seed.series(3, n, 0, 3).reduce<number[]>((a, v) => [...a, (a[a.length - 1] ?? 2) + v], [])
      const plansUsed = ['Starter', 'Growth', 'Enterprise']
      return {
        stats: [
          stat('orgs', 'Total organisations', live.length), stat('active', 'Active organisations', live.filter((o) => o.status === 'active').length),
          stat('trial', 'On trial', live.filter((o) => o.subscription_status === 'trialing').length), stat('paid', 'Paid', live.filter((o) => o.subscription_status === 'active').length),
          stat('expired', 'Expired', live.filter((o) => o.subscription_status === 'expired').length), stat('mrr', 'Monthly recurring revenue', money(495000), { hint: 'Sample figure' }),
          stat('failed', 'Failed payments', seed.payments.filter((p) => p.status === 'failed').length), stat('open_support', 'Open support conversations', seed.convos.filter((x) => x.status === 'open').length),
        ],
        charts: [
          line('org_growth', 'Organisations over time', seed.dayLabels(n, step), [{ name: 'Organisations', data: cum }]),
          donut('subs', 'Trial versus paid', ['Trial', 'Paid', 'Expired', 'Past due'], ['trialing', 'active', 'expired', 'past_due'].map((s) => live.filter((o) => o.subscription_status === s).length)),
          donut('plans', 'Plan distribution', plansUsed, plansUsed.map((p) => live.filter((o) => o.plan === p).length)),
          donut('pay_status', 'Payment status', ['Successful', 'Pending', 'Failed', 'Refunded'], ['success', 'pending', 'failed', 'refunded'].map((s) => seed.payments.filter((p) => p.status === s).length)),
        ],
        recent: seed.auditLogs.slice(0, 6).map((l) => ({ id: String(l.id), text: `${l.actor}: ${l.action} (${l.subject})`, time: l.created_at })),
      }
    }
  }
}
function revenue(r: number): MetricsPayload {
  const { n, step } = pts(r)
  const sum = (f: (p: seed.Payment) => boolean) => seed.payments.filter(f).reduce((a, p) => a + p.amount, 0)
  const gross = sum((p) => p.status === 'success'); const ref_ = seed.refunds.filter((x) => x.status === 'success').reduce((a, x) => a + x.amount, 0)
  const fees = seed.payments.filter((p) => p.status === 'success').reduce((a, p) => a + (p.provider_fee ?? 0), 0)
  const st = (s: string) => seed.settlements.filter((x) => x.status === s).reduce((a, x) => a + x.amount, 0)
  const gs = seed.series(2, n, 30000, 90000)
  return {
    stats: [
      stat('gross', 'Gross successful payments', money(gross)), stat('refunds', 'Refunds', money(ref_)), stat('fees', 'Provider fees', money(fees)),
      stat('net', 'Estimated net receipts', money(gross - ref_ - fees), { hint: 'Estimate, not a confirmed settlement' }),
      stat('pending', 'Pending settlements', money(st('pending'))), stat('confirmed', 'Confirmed settlements', money(st('confirmed'))),
    ],
    charts: [
      line('rev', 'Revenue trend', seed.dayLabels(n, step), [{ name: 'Gross payments', data: gs }, { name: 'Refunds', data: seed.series(8, n, 0, 12000) }]),
      donut('pay_status', 'Payment status', ['Successful', 'Pending', 'Failed', 'Refunded'], ['success', 'pending', 'failed', 'refunded'].map((s) => seed.payments.filter((p) => p.status === s).length)),
      line('net', 'Estimated net receipts', seed.dayLabels(n, step), [{ name: 'Estimated net', data: gs.map((g) => Math.round(g * 0.93)) }], 'area', true),
    ],
  }
}

// ---------- routes ----------
const DASH: Record<string, Role> = { 'super-admin': 'super_admin', organization: 'org_admin', 'support-manager': 'support_manager', technician: 'technician', employee: 'employee', customer: 'customer' }
const need = (c: Ctx, ...roles: Role[]) => { if (!roles.includes(c.role)) fail(403, 'This is not available for your role.') }
const toNotif = (n: seed.Notif) => ({ id: n.id, type: n.type, title: n.title, body: n.body, url: n.url, urgent: n.urgent, read_at: n.read ? n.created : null, created_at: n.created })
const noop: Handler = () => undefined
const convoRow = (x: seed.Convo) => ({ id: x.id, subject: x.subject, category: x.category, status: x.status, priority: x.priority, organization: x.organization, sender: x.sender, last_message_at: x.last_message_at, awaiting_reply: x.awaiting_reply })
function convoThread(x: seed.Convo, c: Ctx) { return { data: { id: x.id, subject: x.subject, status: x.status, priority: x.priority, messages: x.messages, can_reply: true, can_manage: c.role === 'super_admin' } } }
function addMessage(x: seed.Convo, c: Ctx) {
  const staff = c.role === 'super_admin'
  x.messages.push({ id: x.messages.length + 1, author: c.me.name, body: str(c.body.body), created_at: new Date().toISOString(), is_staff: staff })
  x.last_message_at = new Date().toISOString(); x.awaiting_reply = !staff; x.status = staff ? 'answered' : 'open'
}
const findConvo = (c: Ctx) => seed.convos.find((x) => x.id === Number(c.params.id)) ?? fail(404, 'Conversation not found.')
const findIn = <T extends { id: number }>(rows: T[], c: Ctx, what: string) => rows.find((r) => r.id === Number(c.params.id)) ?? fail(404, `${what} not found.`)
const crudFields = (target: seed.Named, b: Body) => { if ('name' in b) target.name = str(b.name); if ('description' in b) target.description = str(b.description); if ('is_active' in b) target.is_active = !!b.is_active }
const requireName = (b: Body) => { if (!str(b.name).trim()) fail(422, 'Invalid.', { name: ['The name is required.'] }) }

const routes: [string, string, Handler][] = [
  // public and account
  ['GET', '/plans', () => fail(404, 'Plans come from the real API.')],
  ['POST', '/contact', noop], ['POST', '/auth/forgot-password', noop], ['POST', '/auth/reset-password', noop], ['POST', '/auth/email/verification-notification', noop],
  ['POST', '/auth/logout', () => { clearDemoRole(); return undefined }],
  ['GET', '/me', (c) => ({ data: userFor(c.role) })],
  ['GET', '/me/profile', (c) => {
    const [first, ...rest] = c.me.name.split(' ')
    const dept = seed.departments.find((d) => d.id === c.me.dept)
    return { data: { id: c.me.id, first_name: first, last_name: rest.join(' '), email: c.me.email, phone: c.me.phone ?? null, job_title: c.me.title ?? null, avatar_url: null, role: c.role, department: dept ? { id: dept.id, name: dept.name } : null, organization: c.role === 'super_admin' ? null : { id: 1, name: seed.ORG_NAME }, email_verified_at: seed.ago(30 * seed.D) } }
  }],
  ['PATCH', '/me/profile', (c) => {
    const b = c.body; const first = str(b.first_name ?? c.me.name.split(' ')[0]); const last = str(b.last_name ?? c.me.name.split(' ').slice(1).join(' '))
    c.me.name = `${first} ${last}`.trim(); if (b.email) c.me.email = str(b.email); if ('phone' in b) c.me.phone = str(b.phone); if ('job_title' in b) c.me.title = str(b.job_title)
  }],
  ['POST', '/me/avatar', () => ({ data: { avatar_url: null } })], ['POST', '/me/password', noop],
  ['GET', '/me/notification-preferences', (c) => ({ data: seed.prefs[c.role] })],
  ['PUT', '/me/notification-preferences', (c) => { Object.assign(seed.prefs[c.role], c.body) }],
  // notifications
  ['GET', '/notifications', (c) => {
    const f = str(c.query.filter) || 'all'
    const rows = seed.notifications[c.role].filter((n) => (f === 'unread' ? !n.read : f === 'read' ? n.read : true)).map(toNotif)
    return listOf(rows, { page: c.query.page, per_page: c.query.per_page })
  }],
  ['GET', '/notifications/unread-count', (c) => ({ count: seed.notifications[c.role].filter((n) => !n.read).length })],
  ['POST', '/notifications/read-all', (c) => { seed.notifications[c.role].forEach((n) => { n.read = true }) }],
  ['POST', '/notifications/:id/read', (c) => { const n = seed.notifications[c.role].find((x) => x.id === c.params.id); if (n) n.read = true }],
  // options
  ['GET', '/options/departments', () => ({ data: seed.departments.filter((d) => d.is_active).map((d) => ({ value: d.id, label: d.name })) })],
  ['GET', '/options/teams', () => ({ data: seed.teams.filter((t) => t.is_active).map((t) => ({ value: t.id, label: t.name })) })],
  ['GET', '/options/roles', () => ({ data: (['org_admin', 'support_manager', 'technician', 'employee', 'customer'] as Role[]).map((r) => ({ value: r, label: ROLE_LABEL[r] })) })],
  ['GET', '/options/organizations', () => ({ data: seed.orgs.map((o) => ({ value: o.id, label: o.name })) })],
  ['GET', '/options/users', (c) => ({
    data: orgPeople().filter((p) => (!c.query.role || p.role === c.query.role) && (!c.query.team_id || (seed.members[Number(c.query.team_id)] ?? []).includes(p.id))).map((p) => ({ value: p.id, label: p.name })),
  })],
  // dashboards and reports
  ['GET', '/dashboards/:name', (c) => { const role = DASH[c.params.name]; if (!role || role !== c.role) fail(403, 'This is not your dashboard.'); return metrics(role, c, Number(c.query.range_days) || 30) }],
  ['GET', '/reports', (c) => { need(c, 'org_admin', 'support_manager'); const m = metrics(c.role, c, Number(c.query.range_days) || 30); return { stats: m.stats, charts: m.charts } }],
  ['GET', '/platform-admin/revenue', (c) => { need(c, 'super_admin'); return revenue(Number(c.query.range_days) || 90) }],
  // tickets
  ['GET', '/tickets/form-options', (c) => ({ data: {
    departments: seed.departments.filter((d) => d.is_active).map((d) => ({ value: d.id, label: d.name })), categories: CATEGORIES.map((x, i) => ({ value: i + 1, label: x })),
    priorities: ['low', 'normal', 'high', 'urgent'].map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })), can_set_priority: c.role !== 'customer',
    max_attachment_mb: 10, allowed_extensions: ['pdf', 'png', 'jpg', 'jpeg', 'txt', 'docx', 'xlsx'],
  } })],
  ['GET', '/tickets', (c) => listOf(visibleTickets(c).map(summary), c.query, { search: ['reference', 'subject'], filters: ticketFilters(c.me), rank: { priority: { low: 1, normal: 2, high: 3, urgent: 4 } } })],
  ['POST', '/tickets', (c) => {
    const b = c.body
    if (str(b.subject).trim().length < 3) fail(422, 'Invalid.', { subject: ['Please enter a subject.'] })
    const id = nextId(seed.tickets)
    const t: seed.Ticket = {
      id, subject: str(b.subject), description: str(b.description), category: CATEGORIES[Number(b.category_id) - 1] ?? 'Other', status: 'new',
      priority: (['low', 'normal', 'high', 'urgent'].includes(str(b.priority)) ? str(b.priority) : 'normal') as seed.Ticket['priority'],
      requester: c.me.id, dept: numOrNull(b.department_id) ?? c.me.dept, team: null, assignee: null, created: new Date().toISOString(), updated: new Date().toISOString(), due: null,
      replies: [{ id: `r${id}-1`, author: c.me.name, body: str(b.description), created_at: new Date().toISOString() }], notes: [], history: [{ id: `h${id}-1`, text: 'Ticket created', created_at: new Date().toISOString() }],
    }
    seed.tickets.unshift(t)
    return { data: { id } }
  }],
  ['GET', '/tickets/:id', (c) => ({ data: ticketDetail(findTicket(c), c) })],
  ['POST', '/tickets/:id/replies', (c) => { const t = findTicket(c); t.replies.push({ id: `r${t.id}-${t.replies.length + 1}`, author: c.me.name, body: str(c.body.body), created_at: new Date().toISOString() }); touch(t) }],
  ['POST', '/tickets/:id/notes', (c) => { need(c, ...staffRoles); const t = findTicket(c); t.notes.push({ id: `n${t.id}-${t.notes.length + 1}`, author: c.me.name, body: str(c.body.body), created_at: new Date().toISOString() }); touch(t) }],
  ['POST', '/tickets/:id/status', (c) => {
    need(c, ...staffRoles); const t = findTicket(c); const next = str(c.body.status) as TicketStatus
    if (!TRANSITIONS[t.status].includes(next)) fail(422, 'Invalid.', { status: ['That status change is not allowed.'] })
    t.status = next; touch(t, `Status changed to ${STATUS_LABEL[next]} by ${c.me.name}`)
  }],
  ['POST', '/tickets/:id/assign', (c) => {
    need(c, ...staffRoles); const t = findTicket(c)
    if (c.body.team_id) t.team = Number(c.body.team_id)
    if (c.body.assignee_id) { t.assignee = Number(c.body.assignee_id); if (t.status === 'new') t.status = 'open' }
    touch(t, `Assigned to ${nameOf(t.assignee) ?? 'a team'} by ${c.me.name}`)
  }],
  ['POST', '/tickets/:id/claim', (c) => { need(c, 'technician'); const t = findTicket(c); if (t.assignee !== null) fail(409, 'Someone else already claimed this ticket.'); t.assignee = c.me.id; t.status = t.status === 'new' ? 'open' : t.status; touch(t, `Claimed by ${c.me.name}`) }],
  ['POST', '/tickets/:id/acknowledge', (c) => { need(c, 'technician'); const t = findTicket(c); t.status = 'open'; touch(t, `Acknowledged by ${c.me.name}`) }],
  ['POST', '/tickets/:id/escalate', (c) => { need(c, ...staffRoles); const t = findTicket(c); t.status = 'escalated'; touch(t, `Escalated by ${c.me.name}: ${str(c.body.reason)}`) }],
  // organisation
  ['GET', '/users', (c) => { need(c, 'org_admin'); return listOf(orgPeople().map(userRow), c.query, { search: ['name', 'email'], filters: { is_active: (r, v) => (v === '1' ? r.is_active : !r.is_active) } }) }],
  ['POST', '/users', (c) => {
    need(c, 'org_admin'); const b = c.body
    if (seed.people.some((p) => p.email.toLowerCase() === str(b.email).toLowerCase())) fail(422, 'Invalid.', { email: ['That email address is already used.'] })
    seed.people.push({ id: nextId(seed.people), name: str(b.name), email: str(b.email), role: str(b.role) as Role, dept: numOrNull(b.department_id), team: numOrNull(b.team_id), active: true })
  }],
  ['PATCH', '/users/:id', (c) => {
    need(c, 'org_admin'); const p = seed.people.find((x) => x.id === Number(c.params.id)) ?? fail(404, 'User not found.'); const b = c.body
    if (b.name) p.name = str(b.name); if (b.email) p.email = str(b.email); if (b.role) p.role = str(b.role) as Role
    if ('department_id' in b) p.dept = numOrNull(b.department_id); if ('team_id' in b) p.team = numOrNull(b.team_id)
  }],
  ['POST', '/users/:id/activate', (c) => { need(c, 'org_admin'); const p = seed.people.find((x) => x.id === Number(c.params.id)); if (p) p.active = true }],
  ['POST', '/users/:id/deactivate', (c) => { need(c, 'org_admin'); const p = seed.people.find((x) => x.id === Number(c.params.id)); if (p) p.active = false }],
  ['GET', '/departments', (c) => listOf(seed.departments.map((d) => ({ ...d, users_count: seed.people.filter((p) => p.dept === d.id).length })), c.query, { search: ['name', 'description'] })],
  ['POST', '/departments', (c) => { requireName(c.body); const d: seed.Named = { id: nextId(seed.departments), name: '', description: '', is_active: true }; crudFields(d, c.body); seed.departments.push(d) }],
  ['PATCH', '/departments/:id', (c) => crudFields(findIn(seed.departments, c, 'Department'), c.body)],
  ['GET', '/teams', (c) => listOf(seed.teams.map((t) => ({ ...t, members_count: (seed.members[t.id] ?? []).length })), c.query, { search: ['name', 'description'] })],
  ['POST', '/teams', (c) => { requireName(c.body); const t: seed.Named = { id: nextId(seed.teams), name: '', description: '', is_active: true }; crudFields(t, c.body); seed.teams.push(t); seed.members[t.id] = [] }],
  ['PATCH', '/teams/:id', (c) => crudFields(findIn(seed.teams, c, 'Team'), c.body)],
  ['GET', '/teams/:id/members', (c) => ({ data: (seed.members[Number(c.params.id)] ?? []).map((id) => seed.people.find((p) => p.id === id)!).filter(Boolean).map((p) => ({ id: p.id, name: p.name, email: p.email })) })],
  ['POST', '/teams/:id/members', (c) => { const id = Number(c.params.id); const list = (seed.members[id] ??= []); const uid = Number(c.body.user_id); if (!list.includes(uid)) list.push(uid) }],
  ['DELETE', '/teams/:id/members/:uid', (c) => { const id = Number(c.params.id); seed.members[id] = (seed.members[id] ?? []).filter((x) => x !== Number(c.params.uid)) }],
  ['GET', '/organization/settings', () => ({ data: seed.orgSettings })],
  ['PATCH', '/organization/settings', (c) => { need(c, 'org_admin'); Object.assign(seed.orgSettings, c.body) }],
  ['GET', '/organization/billing', (c) => {
    need(c, 'org_admin')
    return { data: { plan: null, status: 'trialing', trial_ends_at: seed.orgs[0].trial_ends_at, current_period_end: null, grace_ends_at: null, renewal_status: null, payments: [],
      plans: seed.plans.map((p) => ({ id: String(p.id), name: p.name, description: p.description, price_monthly: p.price_monthly, currency: p.currency, features: p.features_text.split('\n').filter(Boolean) })) } }
  }],
  ['POST', '/billing/checkout', () => fail(400, 'Payments are turned off in the demo.')],
  ['GET', '/billing/verify', () => ({ status: 'pending' })],
  ['GET', '/announcements', (c) => listOf(seed.orgAnnouncements, c.query)],
  ['POST', '/announcements/:id/read', (c) => { const a = seed.orgAnnouncements.find((x) => x.id === Number(c.params.id)); if (a) a.read = true }],
  ['POST', '/announcements/:id/acknowledge', (c) => { const a = seed.orgAnnouncements.find((x) => x.id === Number(c.params.id)); if (a) { a.read = true; a.acknowledged = true } }],
  ['GET', '/platform-support', (c) => listOf(seed.convos.filter((x) => x.organization === seed.ORG_NAME).map(convoRow), c.query, { search: ['subject'] })],
  ['POST', '/platform-support', (c) => {
    const b = c.body; if (!str(b.subject).trim()) fail(422, 'Invalid.', { subject: ['The subject is required.'] })
    const id = nextId(seed.convos)
    seed.convos.unshift({ id, subject: str(b.subject), category: str(b.category), status: 'open', priority: 'normal', organization: seed.ORG_NAME, sender: c.me.name, last_message_at: new Date().toISOString(), awaiting_reply: true,
      messages: [{ id: 1, author: c.me.name, body: str(b.body), created_at: new Date().toISOString(), is_staff: false }] })
  }],
  ['GET', '/platform-support/:id', (c) => convoThread(findConvo(c), c)],
  ['POST', '/platform-support/:id/messages', (c) => addMessage(findConvo(c), c)],
  // platform admin
  ['GET', '/platform-admin/organizations', (c) => { need(c, 'super_admin'); return listOf(seed.orgs, c.query, { search: ['name'] }) }],
  ['GET', '/platform-admin/organizations/:id', (c) => { need(c, 'super_admin'); const o = findIn(seed.orgs, c, 'Organisation'); return { data: { id: o.id, name: o.name, status: o.status, plan: o.plan ?? 'None (trial)', subscription_status: o.subscription_status, owner_email: o.owner_email, users_count: o.users_count, created_at: o.created_at, trial_ends_at: o.trial_ends_at } } }],
  ['POST', '/platform-admin/organizations/:id/suspend', (c) => { need(c, 'super_admin'); findIn(seed.orgs, c, 'Organisation').status = 'suspended' }],
  ['POST', '/platform-admin/organizations/:id/reactivate', (c) => { need(c, 'super_admin'); findIn(seed.orgs, c, 'Organisation').status = 'active' }],
  ['GET', '/platform-admin/subscriptions', (c) => { need(c, 'super_admin'); return listOf(seed.orgs.map((o) => ({ id: o.id, organization: o.name, plan: o.plan, status: o.subscription_status, trial_ends_at: o.trial_ends_at, current_period_end: o.subscription_status === 'active' ? seed.ahead(20 * seed.D) : null, renewal_status: o.subscription_status === 'active' ? 'Auto-renew' : null })), c.query, { search: ['organization'] }) }],
  ['GET', '/platform-admin/plans', (c) => { need(c, 'super_admin'); return listOf(seed.plans, c.query) }],
  ['POST', '/platform-admin/plans', (c) => { requireName(c.body); const b = c.body; seed.plans.push({ id: nextId(seed.plans), name: str(b.name), description: str(b.description), price_monthly: numOrNull(b.price_monthly), currency: str(b.currency) || null, trial_days: numOrNull(b.trial_days), agents_limit: numOrNull(b.agents_limit), tickets_limit: numOrNull(b.tickets_limit), is_active: !!b.is_active, features_text: str(b.features_text) }) }],
  ['PATCH', '/platform-admin/plans/:id', (c) => { const p = findIn(seed.plans, c, 'Plan'); const b = c.body; p.name = str(b.name ?? p.name); p.description = str(b.description ?? p.description); p.price_monthly = numOrNull(b.price_monthly); p.currency = str(b.currency) || null; p.trial_days = numOrNull(b.trial_days); p.agents_limit = numOrNull(b.agents_limit); p.tickets_limit = numOrNull(b.tickets_limit); p.is_active = !!b.is_active; p.features_text = str(b.features_text) }],
  ['GET', '/platform-admin/payments', (c) => { need(c, 'super_admin'); return listOf(seed.payments, c.query, { search: ['reference', 'organization'] }) }],
  ['POST', '/platform-admin/payments/:id/refund', (c) => {
    need(c, 'super_admin'); const p = findIn(seed.payments, c, 'Payment'); p.status = 'refunded'; p.can_refund = false
    seed.refunds.unshift({ id: nextId(seed.refunds), payment_reference: p.reference, organization: p.organization, amount: p.amount, currency: p.currency, status: 'pending', created_at: new Date().toISOString() })
  }],
  ['GET', '/platform-admin/settlements', (c) => { need(c, 'super_admin'); return listOf(seed.settlements, c.query) }],
  ['GET', '/platform-admin/refunds', (c) => { need(c, 'super_admin'); return listOf(seed.refunds, c.query) }],
  ['GET', '/platform-admin/audit-logs', (c) => { need(c, 'super_admin'); return listOf(seed.auditLogs, c.query, { search: ['actor', 'action', 'subject'] }) }],
  ['GET', '/platform-admin/announcements', (c) => { need(c, 'super_admin'); return listOf(seed.platformAnnouncements, c.query, { search: ['title'] }) }],
  ['POST', '/platform-admin/announcements', (c) => {
    const b = c.body; if (!str(b.title).trim()) fail(422, 'Invalid.', { title: ['The title is required.'] })
    seed.platformAnnouncements.unshift({ id: nextId(seed.platformAnnouncements), title: str(b.title), body: str(b.body), category: str(b.category), severity: str(b.severity), status: b.publish_at ? 'scheduled' : 'draft', target_audience: str(b.target_audience) || 'all', publish_at: b.publish_at ? new Date(str(b.publish_at)).toISOString() : null })
  }],
  ['PATCH', '/platform-admin/announcements/:id', (c) => { const a = findIn(seed.platformAnnouncements, c, 'Announcement'); const b = c.body; a.title = str(b.title ?? a.title); a.body = str(b.body ?? a.body); a.category = str(b.category ?? a.category); a.severity = str(b.severity ?? a.severity); a.target_audience = str(b.target_audience ?? a.target_audience) }],
  ['POST', '/platform-admin/announcements/:id/publish', (c) => { const a = findIn(seed.platformAnnouncements, c, 'Announcement'); a.status = 'published'; a.publish_at = new Date().toISOString() }],
  ['POST', '/platform-admin/announcements/:id/archive', (c) => { findIn(seed.platformAnnouncements, c, 'Announcement').status = 'archived' }],
  ['GET', '/platform-admin/support', (c) => { need(c, 'super_admin'); return listOf(seed.convos.map(convoRow), c.query, { search: ['subject', 'organization', 'sender'], filters: { awaiting_reply: (r, v) => (v === '1' ? r.awaiting_reply : true) } }) }],
  ['GET', '/platform-admin/support/:id', (c) => { need(c, 'super_admin'); return convoThread(findConvo(c), c) }],
  ['PATCH', '/platform-admin/support/:id', (c) => { need(c, 'super_admin'); const x = findConvo(c); if (c.body.status) x.status = str(c.body.status); if (c.body.priority) x.priority = str(c.body.priority) }],
  ['POST', '/platform-admin/support/:id/messages', (c) => { need(c, 'super_admin'); addMessage(findConvo(c), c) }],
]

function match(pattern: string, path: string): Record<string, string> | null {
  const a = pattern.split('/'); const b = path.split('/')
  if (a.length !== b.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i])
    else if (a[i] !== b[i]) return null
  }
  return params
}
const PUBLIC = ['/plans', '/contact', '/auth/forgot-password', '/auth/reset-password', '/auth/email/verification-notification', '/auth/logout']

/** Same contract as the real API client: resolves with the JSON body, or throws ApiError. */
export async function demoRequest<T>(method: string, path: string, body?: unknown, query?: Q): Promise<T> {
  await sleep(DELAY)
  const [p, qs] = path.split('?')
  const q: Q = { ...Object.fromEntries(new URLSearchParams(qs ?? '')), ...(query ?? {}) }
  const role = getDemoRole()
  if (!role && !PUBLIC.includes(p)) fail(401, 'Unauthenticated.')
  const data: Body = body instanceof FormData ? Object.fromEntries([...body.entries()].filter(([, v]) => typeof v === 'string')) : ((body as Body | undefined) ?? {})
  for (const [m, pattern, handler] of routes) {
    if (m !== method) continue
    const params = match(pattern, p)
    if (!params) continue
    const ctx: Ctx = { role: role ?? 'employee', me: seed.people.find((x) => x.id === seed.ME_BY_ROLE[role ?? 'employee'])!, params, query: q, body: data }
    const result = handler(ctx)
    return (result === undefined ? undefined : structuredClone(result)) as T
  }
  return fail(404, 'This page is not available in the demo.')
}
