import type { Role } from '@/types/auth'
import type { TicketPriority, TicketStatus } from '@/types/ticket'
import type { NotificationPreferences } from '@/types/user'

/** ALL DATA IN THIS FILE IS MADE UP for the demo. */

const H = 3_600_000
const D = 24 * H
const NOW = Date.now()
export const ago = (ms: number) => new Date(NOW - ms).toISOString()
export const ahead = (ms: number) => new Date(NOW + ms).toISOString()
export { H, D }

/** Repeatable "random" numbers so charts look the same every time. */
export function series(seed: number, n: number, base: number, spread: number): number[] {
  let s = seed
  return Array.from({ length: n }, () => { s = (s * 9301 + 49297) % 233280; return Math.round(base + (s / 233280) * spread) })
}
export function dayLabels(n: number, stepDays: number): string[] {
  return Array.from({ length: n }, (_, i) => new Date(NOW - (n - 1 - i) * stepDays * D).toLocaleDateString('en', { month: 'short', day: 'numeric' }))
}

export interface Person { id: number; name: string; email: string; role: Role; dept: number | null; team: number | null; active: boolean; phone?: string; title?: string }
export const ORG_NAME = 'BrightTech Ltd'

export const people: Person[] = [
  { id: 100, name: 'Chinedu Eze', email: 'chinedu@qelvoro.example', role: 'super_admin', dept: null, team: null, active: true, title: 'Platform administrator' },
  { id: 1, name: 'Olumide Adebayo', email: 'olumide@brighttech.example', role: 'org_admin', dept: 5, team: null, active: true, phone: '+234 800 000 0001', title: 'Operations lead' },
  { id: 2, name: 'Funke Balogun', email: 'funke@brighttech.example', role: 'support_manager', dept: 1, team: 4, active: true, title: 'IT support manager' },
  { id: 3, name: 'Tunde Bakare', email: 'tunde@brighttech.example', role: 'technician', dept: 1, team: 1, active: true, title: 'Network engineer' },
  { id: 4, name: 'Ngozi Eze', email: 'ngozi@brighttech.example', role: 'technician', dept: 1, team: 2, active: true, title: 'Hardware technician' },
  { id: 5, name: 'Ibrahim Musa', email: 'ibrahim@brighttech.example', role: 'technician', dept: 1, team: 3, active: true, title: 'Software support' },
  { id: 6, name: 'Amina Yusuf', email: 'amina@brighttech.example', role: 'employee', dept: 2, team: null, active: true, title: 'HR officer' },
  { id: 7, name: 'John Doe', email: 'john@brighttech.example', role: 'employee', dept: 1, team: null, active: true, title: 'Developer' },
  { id: 8, name: 'Sarah Johnson', email: 'sarah@brighttech.example', role: 'employee', dept: 3, team: null, active: true, title: 'Accountant' },
  { id: 9, name: 'Emeka Okafor', email: 'emeka@brighttech.example', role: 'employee', dept: 5, team: null, active: true, title: 'Operations officer' },
  { id: 10, name: 'David Wilson', email: 'david@customer.example', role: 'customer', dept: null, team: null, active: true },
  { id: 11, name: 'Chidera Obi', email: 'chidera@brighttech.example', role: 'employee', dept: 4, team: null, active: false, title: 'Marketing executive' },
  { id: 12, name: 'Zainab Lawal', email: 'zainab@customer.example', role: 'customer', dept: null, team: null, active: true },
]
export const ME_BY_ROLE: Record<Role, number> = { super_admin: 100, org_admin: 1, support_manager: 2, technician: 3, employee: 6, customer: 10 }

export interface Named { id: number; name: string; description: string; is_active: boolean }
export const departments: Named[] = [
  { id: 1, name: 'IT', description: 'Systems, networks and devices', is_active: true },
  { id: 2, name: 'Human Resources', description: 'People and recruitment', is_active: true },
  { id: 3, name: 'Finance', description: 'Accounts and payments', is_active: true },
  { id: 4, name: 'Marketing', description: 'Brand and campaigns', is_active: true },
  { id: 5, name: 'Operations', description: 'Day-to-day running of the business', is_active: true },
]
export const teams: Named[] = [
  { id: 1, name: 'Network Support', description: 'Internet, Wi-Fi and VPN', is_active: true },
  { id: 2, name: 'Hardware Support', description: 'Laptops, printers and peripherals', is_active: true },
  { id: 3, name: 'Software Support', description: 'Applications and licences', is_active: true },
  { id: 4, name: 'Systems Administration', description: 'Accounts, access and servers', is_active: true },
]
export const members: Record<number, number[]> = { 1: [3], 2: [4], 3: [5], 4: [3, 5] }

export interface Msg { id: string; author: string; body: string; created_at: string }
export interface Hist { id: string; text: string; created_at: string }
export interface Ticket {
  id: number; subject: string; description: string; category: string
  status: TicketStatus; priority: TicketPriority
  requester: number; dept: number | null; team: number | null; assignee: number | null
  created: string; updated: string; due: string | null
  replies: Msg[]; notes: Msg[]; history: Hist[]
}
const T = (id: number, subject: string, category: string, status: TicketStatus, priority: TicketPriority, requester: number, dept: number | null, team: number | null, assignee: number | null, createdAgo: number, updatedAgo: number, dueIn: number | null, description: string): Ticket => ({
  id, subject, description, category, status, priority, requester, dept, team, assignee,
  created: ago(createdAgo), updated: ago(updatedAgo), due: dueIn === null ? null : (dueIn >= 0 ? ahead(dueIn) : ago(-dueIn)),
  replies: [], notes: [], history: [{ id: `h${id}-1`, text: 'Ticket created', created_at: ago(createdAgo) }],
})
export const tickets: Ticket[] = [
  T(1, 'Laptop not turning on', 'Hardware', 'open', 'high', 7, 1, 2, 4, 2 * D, 3 * H, 1 * D, 'My laptop will not power on since this morning. The charging light does not come on.'),
  T(2, 'Request for new software', 'Software', 'in_progress', 'normal', 8, 3, 3, 5, 3 * D, 5 * H, 2 * D, 'Please install the latest spreadsheet add-in on my machine for month-end reports.'),
  T(3, 'Printer not working', 'Hardware', 'resolved', 'low', 9, 5, 2, 4, 5 * D, 1 * D, null, 'The printer on the second floor shows an offline message.'),
  T(4, 'Access to shared drive', 'Access', 'open', 'normal', 6, 2, 4, 3, 1 * D, 6 * H, 2 * D, 'I need access to the HR shared drive for the new policy documents.'),
  T(5, 'Software installation request', 'Software', 'resolved', 'low', 11, 4, 3, 5, 6 * D, 2 * D, null, 'Please install the design tool for the new campaign.'),
  T(6, 'VPN keeps disconnecting', 'Network', 'escalated', 'urgent', 7, 1, 1, 3, 1 * D, 2 * H, -3 * H, 'The VPN drops every few minutes, so I cannot reach internal systems from home.'),
  T(7, 'Wi-Fi slow on the second floor', 'Network', 'new', 'high', 8, 3, 1, null, 8 * H, 8 * H, 1 * D, 'Pages take very long to load in the finance area.'),
  T(8, 'Email not syncing on phone', 'Software', 'new', 'normal', 6, 2, null, null, 5 * H, 5 * H, 2 * D, 'My work email stopped updating on my phone yesterday.'),
  T(9, 'Monitor flickering', 'Hardware', 'pending_requester', 'low', 9, 5, 2, 4, 4 * D, 1 * D, null, 'The second monitor flickers when I plug in the laptop.'),
  T(10, 'Need a password reset', 'Access', 'new', 'urgent', 6, 2, null, null, 2 * H, 2 * H, 4 * H, 'I am locked out of my account before an important meeting.'),
  T(11, 'Projector not detected in meeting room', 'Hardware', 'in_progress', 'normal', 11, 4, 2, 4, 2 * D, 6 * H, 1 * D, 'The projector in Meeting Room 2 is not detected by any laptop.'),
  T(12, 'Accounting software licence expired', 'Software', 'open', 'high', 8, 3, 3, 5, 1 * D, 4 * H, -2 * H, 'The accounting software says the licence has expired.'),
  T(13, 'Cannot access my order portal', 'Access', 'open', 'normal', 10, null, null, 3, 2 * D, 1 * D, 1 * D, 'I get an error when I try to open my order portal page.'),
  T(14, 'Invoice link is broken', 'Other', 'resolved', 'low', 10, null, null, 3, 6 * D, 3 * D, null, 'The link in my invoice email does not open.'),
]
// conversation and history for the sample tickets
for (const t of tickets) {
  const req = people.find((p) => p.id === t.requester)!
  t.replies.push({ id: `r${t.id}-1`, author: req.name, body: t.description, created_at: t.created })
  if (t.assignee) {
    const a = people.find((p) => p.id === t.assignee)!
    t.history.push({ id: `h${t.id}-2`, text: `Assigned to ${a.name}`, created_at: new Date(Date.parse(t.created) + H).toISOString() })
    t.replies.push({ id: `r${t.id}-2`, author: a.name, body: 'Thanks for reporting this. I am looking into it now and will update you shortly.', created_at: t.updated })
  }
  if (t.status !== 'new') t.history.push({ id: `h${t.id}-3`, text: `Status changed to ${t.status.replace(/_/g, ' ')}`, created_at: t.updated })
}
tickets[5].notes.push({ id: 'n6-1', author: 'Funke Balogun', body: 'Possible ISP issue on the main line. Asked Network Support to check the router logs.', created_at: ago(5 * H) })

export interface Notif { id: string; type: string; title: string; body: string; url: string | null; urgent?: boolean; read: boolean; created: string }
const N = (id: string, type: string, title: string, body: string, url: string | null, createdAgo: number, read = false, urgent = false): Notif => ({ id, type, title, body, url, urgent, read, created: ago(createdAgo) })
export const notifications: Record<Role, Notif[]> = {
  super_admin: [
    N('s1', 'organization.registered', 'A new organisation has registered', 'Sunrise Retail started a trial.', '/platform-admin/organizations', 40 * 60_000),
    N('s2', 'payment.failed', 'A payment has failed', 'CloudNine Tech: renewal payment failed.', '/platform-admin/payments', 3 * H),
    N('s3', 'platform.support', 'New platform-support conversation', 'BrightTech Ltd asked about billing.', '/platform-admin/support', 5 * H, true),
  ],
  org_admin: [
    N('a1', 'subscription.trial', 'Your trial is approaching expiration', 'Choose a plan to keep full access.', '/admin/billing', 30 * 60_000),
    N('a2', 'ticket.escalated', 'Ticket TCK-0006 was escalated', 'VPN keeps disconnecting.', '/tickets/6', 2 * H, false, true),
    N('a3', 'announcement.published', 'A new platform announcement is available', 'Scheduled maintenance notice.', '/admin/announcements', 6 * H),
    N('a4', 'user.joined', 'A new user accepted your invitation', 'Chidera Obi joined BrightTech Ltd.', '/admin/users', 2 * D, true),
  ],
  support_manager: [
    N('m1', 'ticket.created', 'Urgent ticket is unassigned', 'TCK-0010: Need a password reset.', '/tickets/10', 2 * H, false, true),
    N('m2', 'ticket.escalated', 'A ticket was escalated', 'TCK-0006: VPN keeps disconnecting.', '/tickets/6', 4 * H),
    N('m3', 'ticket.created', 'New ticket needs a team', 'TCK-0008: Email not syncing on phone.', '/tickets/8', 5 * H, true),
  ],
  technician: [
    N('t1', 'ticket.assigned', 'A ticket has been assigned to you', 'TCK-0004: Access to shared drive.', '/tickets/4', 90 * 60_000),
    N('t2', 'ticket.urgent', 'A ticket has been marked urgent', 'TCK-0006: VPN keeps disconnecting.', '/tickets/6', 2 * H, false, true),
    N('t3', 'ticket.reply', 'A requester has replied', 'John Doe replied on TCK-0006.', '/tickets/6', 6 * H, true),
  ],
  employee: [
    N('e1', 'ticket.received', 'Your ticket has been received', 'TCK-0010: Need a password reset.', '/tickets/10', 2 * H),
    N('e2', 'ticket.reply', 'Support has replied', 'Tunde Bakare replied on TCK-0004.', '/tickets/4', 6 * H),
    N('e3', 'ticket.resolved', 'Your ticket has been resolved', 'TCK-0003: Printer not working.', '/tickets/3', 1 * D, true),
  ],
  customer: [
    N('c1', 'ticket.reply', 'Support has replied', 'Tunde Bakare replied on TCK-0013.', '/tickets/13', 1 * D),
    N('c2', 'ticket.resolved', 'Your request has been resolved', 'TCK-0014: Invoice link is broken.', '/tickets/14', 3 * D, true),
  ],
}
export const prefs: Record<Role, NotificationPreferences> = Object.fromEntries(
  (['super_admin', 'org_admin', 'support_manager', 'technician', 'employee', 'customer'] as Role[]).map((r) => [r, {
    in_app: true, email: true, sound: false, categories: ['tickets', 'billing', 'announcements', 'platform_support'], quiet_hours: { enabled: false, start: '22:00', end: '07:00' },
  }]),
) as Record<Role, NotificationPreferences>

export interface Convo {
  id: number; subject: string; category: string; status: string; priority: string; organization: string; sender: string
  last_message_at: string; awaiting_reply: boolean; messages: { id: number; author: string; body: string; created_at: string; is_staff: boolean }[]
}
export const convos: Convo[] = [
  { id: 1, subject: 'Question about plans and billing', category: 'billing', status: 'answered', priority: 'normal', organization: ORG_NAME, sender: 'Olumide Adebayo', last_message_at: ago(5 * H), awaiting_reply: false, messages: [
    { id: 1, author: 'Olumide Adebayo', body: 'Hello, we would like to know how billing works after the trial.', created_at: ago(1 * D), is_staff: false },
    { id: 2, author: 'Chinedu Eze', body: 'Hi Olumide, you can pick a plan on the billing page when the trial ends. Happy to help with any questions.', created_at: ago(5 * H), is_staff: true }] },
  { id: 2, subject: 'Cannot invite a new user', category: 'technical', status: 'open', priority: 'high', organization: ORG_NAME, sender: 'Olumide Adebayo', last_message_at: ago(2 * H), awaiting_reply: true, messages: [
    { id: 1, author: 'Olumide Adebayo', body: 'The invite email does not arrive for one of our staff.', created_at: ago(2 * H), is_staff: false }] },
  { id: 3, subject: 'Request to change account owner', category: 'account', status: 'open', priority: 'normal', organization: 'Greenfield Academy', sender: 'Kemi Adeyemi', last_message_at: ago(8 * H), awaiting_reply: true, messages: [
    { id: 1, author: 'Kemi Adeyemi', body: 'We would like to transfer ownership to our new head of IT.', created_at: ago(8 * H), is_staff: false }] },
  { id: 4, subject: 'Security concern: unknown login', category: 'security', status: 'pending', priority: 'urgent', organization: 'Lakeside Hospital', sender: 'Dr Bola Ajayi', last_message_at: ago(1 * D), awaiting_reply: false, messages: [
    { id: 1, author: 'Dr Bola Ajayi', body: 'We saw a login from an unfamiliar location.', created_at: ago(2 * D), is_staff: false },
    { id: 2, author: 'Chinedu Eze', body: 'Thanks for flagging this. We are reviewing the sign-in records and will update you.', created_at: ago(1 * D), is_staff: true }] },
]

export interface Org { id: number; name: string; status: string; plan: string | null; subscription_status: string; created_at: string; users_count: number; trial_ends_at: string | null; owner_email: string }
export const orgs: Org[] = [
  { id: 1, name: ORG_NAME, status: 'active', plan: null, subscription_status: 'trialing', created_at: ago(5 * D), users_count: 12, trial_ends_at: ahead(9 * D), owner_email: 'olumide@brighttech.example' },
  { id: 2, name: 'Greenfield Academy', status: 'active', plan: 'Starter', subscription_status: 'active', created_at: ago(40 * D), users_count: 34, trial_ends_at: null, owner_email: 'admin@greenfield.example' },
  { id: 3, name: 'Lakeside Hospital', status: 'active', plan: 'Enterprise', subscription_status: 'active', created_at: ago(95 * D), users_count: 120, trial_ends_at: null, owner_email: 'it@lakeside.example' },
  { id: 4, name: 'Northwind Pharmacy', status: 'suspended', plan: 'Starter', subscription_status: 'expired', created_at: ago(70 * D), users_count: 9, trial_ends_at: null, owner_email: 'owner@northwind.example' },
  { id: 5, name: 'Apex Manufacturing', status: 'active', plan: 'Growth', subscription_status: 'active', created_at: ago(60 * D), users_count: 58, trial_ends_at: null, owner_email: 'ops@apex.example' },
  { id: 6, name: 'Sunrise Retail', status: 'active', plan: null, subscription_status: 'trialing', created_at: ago(2 * D), users_count: 6, trial_ends_at: ahead(12 * D), owner_email: 'hello@sunrise.example' },
  { id: 7, name: 'Meridian Finance', status: 'active', plan: 'Enterprise', subscription_status: 'active', created_at: ago(150 * D), users_count: 210, trial_ends_at: null, owner_email: 'tech@meridian.example' },
  { id: 8, name: 'CloudNine Tech', status: 'active', plan: 'Growth', subscription_status: 'past_due', created_at: ago(30 * D), users_count: 22, trial_ends_at: null, owner_email: 'team@cloudnine.example' },
]
export interface Plan { id: number; name: string; description: string; price_monthly: number | null; currency: string | null; trial_days: number | null; agents_limit: number | null; tickets_limit: number | null; is_active: boolean; features_text: string }
// Prices are left unset on purpose: real pricing has not been decided.
export const plans: Plan[] = [
  { id: 1, name: 'Starter', description: 'For small teams getting their support organised.', price_monthly: null, currency: null, trial_days: 14, agents_limit: null, tickets_limit: null, is_active: true, features_text: 'Ticket management\nDepartments and support teams\nIn-app notifications' },
  { id: 2, name: 'Growth', description: 'For growing organisations with several support teams.', price_monthly: null, currency: null, trial_days: 14, agents_limit: null, tickets_limit: null, is_active: true, features_text: 'Everything in Starter\nReports and analytics\nTicket assignment and escalation' },
  { id: 3, name: 'Enterprise', description: 'For larger organisations with advanced needs.', price_monthly: null, currency: null, trial_days: null, agents_limit: null, tickets_limit: null, is_active: true, features_text: 'Everything in Growth\nOptional external customer portal\nPriority platform support' },
]
export interface Payment { id: number; reference: string; organization: string; amount: number; currency: string; provider_fee: number | null; status: string; paid_at: string | null; can_refund: boolean }
const P = (id: number, org: string, amount: number, status: string, daysAgo: number): Payment => ({ id, reference: `SAMPLE_${String(1000 + id)}`, organization: org, amount, currency: 'NGN', provider_fee: status === 'failed' ? null : Math.round(amount * 0.015), status, paid_at: status === 'pending' ? null : ago(daysAgo * D), can_refund: status === 'success' })
export const payments: Payment[] = [
  P(1, 'Greenfield Academy', 45000, 'success', 3), P(2, 'Lakeside Hospital', 180000, 'success', 5), P(3, 'Apex Manufacturing', 90000, 'success', 6),
  P(4, 'Meridian Finance', 180000, 'success', 9), P(5, 'CloudNine Tech', 90000, 'failed', 2), P(6, 'Northwind Pharmacy', 45000, 'refunded', 20),
  P(7, 'Greenfield Academy', 45000, 'success', 33), P(8, 'Lakeside Hospital', 180000, 'success', 35), P(9, 'Apex Manufacturing', 90000, 'pending', 0),
  P(10, 'Meridian Finance', 180000, 'success', 39), P(11, 'CloudNine Tech', 90000, 'success', 31), P(12, 'Northwind Pharmacy', 45000, 'success', 50),
]
export const settlements = [
  { id: 1, reference: 'SAMPLE_STL_01', amount: 420000, currency: 'NGN', status: 'confirmed', expected_date: ago(10 * D), confirmed_at: ago(9 * D) },
  { id: 2, reference: 'SAMPLE_STL_02', amount: 315000, currency: 'NGN', status: 'confirmed', expected_date: ago(3 * D), confirmed_at: ago(2 * D) },
  { id: 3, reference: 'SAMPLE_STL_03', amount: 180000, currency: 'NGN', status: 'pending', expected_date: ahead(2 * D), confirmed_at: null },
  { id: 4, reference: 'SAMPLE_STL_04', amount: 90000, currency: 'NGN', status: 'pending', expected_date: ahead(4 * D), confirmed_at: null },
]
export const refunds = [
  { id: 1, payment_reference: 'SAMPLE_1006', organization: 'Northwind Pharmacy', amount: 45000, currency: 'NGN', status: 'success', created_at: ago(18 * D) },
  { id: 2, payment_reference: 'SAMPLE_1012', organization: 'Northwind Pharmacy', amount: 45000, currency: 'NGN', status: 'pending', created_at: ago(1 * D) },
]
export const auditLogs = [
  ['Chinedu Eze', 'Suspended organisation', 'Northwind Pharmacy', '102.89.10.4', 12], ['Chinedu Eze', 'Published announcement', 'Scheduled maintenance', '102.89.10.4', 30],
  ['Chinedu Eze', 'Refunded payment', 'SAMPLE_1006', '102.89.10.4', 18 * 24], ['System', 'Trial expired', 'Northwind Pharmacy', '-', 22 * 24],
  ['Chinedu Eze', 'Updated plan', 'Growth', '102.89.10.4', 5 * 24], ['Olumide Adebayo', 'Changed user role', 'Funke Balogun', '41.58.20.9', 60],
  ['Chinedu Eze', 'Created announcement', 'Security notice', '102.89.10.4', 8 * 24], ['System', 'Payment verified', 'SAMPLE_1003', '-', 6 * 24],
  ['Olumide Adebayo', 'Deactivated user', 'Chidera Obi', '41.58.20.9', 2 * 24], ['Chinedu Eze', 'Reactivated organisation', 'Apex Manufacturing', '102.89.10.4', 40 * 24],
].map((r, i) => ({ id: i + 1, actor: r[0] as string, action: r[1] as string, subject: r[2] as string, ip_address: r[3] as string, created_at: ago((r[4] as number) * H) }))
export interface PlatAnn { id: number; title: string; body: string; category: string; severity: string; status: string; target_audience: string; publish_at: string | null }
export const platformAnnouncements: PlatAnn[] = [
  { id: 1, title: 'Scheduled maintenance this weekend', body: 'Short maintenance window on Saturday night.', category: 'maintenance', severity: 'warning', status: 'published', target_audience: 'all', publish_at: ago(6 * H) },
  { id: 2, title: 'New reports are coming', body: 'Better ticket reports for managers.', category: 'product', severity: 'info', status: 'scheduled', target_audience: 'all', publish_at: ahead(3 * D) },
  { id: 3, title: 'Security notice: use strong passwords', body: 'Reminder to review your password policy.', category: 'security', severity: 'info', status: 'draft', target_audience: 'selected', publish_at: null },
  { id: 4, title: 'Billing page update', body: 'The billing page has a new layout.', category: 'billing', severity: 'info', status: 'archived', target_audience: 'all', publish_at: ago(40 * D) },
]
export const orgAnnouncements = [
  { id: 1, title: 'Scheduled maintenance this weekend', category: 'maintenance', severity: 'warning', published_at: ago(6 * H), maintenance_start: ahead(3 * D), maintenance_end: ahead(3 * D + 2 * H), read: false, acknowledged: false, requires_acknowledgement: true },
  { id: 2, title: 'Billing page update', category: 'billing', severity: 'info', published_at: ago(5 * D), maintenance_start: null as string | null, maintenance_end: null as string | null, read: true, acknowledged: false, requires_acknowledgement: false },
  { id: 3, title: 'New reports are coming', category: 'product', severity: 'info', published_at: ago(10 * D), maintenance_start: null as string | null, maintenance_end: null as string | null, read: true, acknowledged: true, requires_acknowledgement: false },
]
export const orgSettings = { name: ORG_NAME, external_support_enabled: true, acknowledgement_minutes: 30 as number | null }
