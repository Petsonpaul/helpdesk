import type { Role } from '@/types/auth'

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: 'Super Admin',
  org_admin: 'Admin',
  support_manager: 'IT Support Manager',
  technician: 'IT Support',
  employee: 'Staff',
  customer: 'Customer',
}

export const ROLE_HOME: Record<Role, string> = {
  super_admin: '/platform-admin',
  org_admin: '/admin',
  support_manager: '/support-manager',
  technician: '/it-support',
  employee: '/staff',
  customer: '/customer',
}

export interface NavItem {
  title: string
  icon: string
  url: string
  /** false = the page does not exist yet, so it is hidden (no dead links). Flip to true when the page is built. */
  ready: boolean
  roles?: Role[]
}

const ALL_ROLES: Role[] = ['super_admin', 'org_admin', 'support_manager', 'technician', 'employee', 'customer']

/** One master list. Each role sees only its own items. This only shapes the menu - Laravel enforces access. */
export const NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', icon: 'solar:widget-2-linear', url: '__home__', ready: true },
  // Platform admin
  { title: 'Organisations', icon: 'tabler:building', url: '/platform-admin/organizations', ready: true, roles: ['super_admin'] },
  { title: 'Subscriptions', icon: 'tabler:repeat', url: '/platform-admin/subscriptions', ready: true, roles: ['super_admin'] },
  { title: 'Plans', icon: 'tabler:list-details', url: '/platform-admin/plans', ready: true, roles: ['super_admin'] },
  { title: 'Revenue', icon: 'tabler:chart-line', url: '/platform-admin/revenue', ready: true, roles: ['super_admin'] },
  { title: 'Payments', icon: 'tabler:credit-card', url: '/platform-admin/payments', ready: true, roles: ['super_admin'] },
  { title: 'Settlements', icon: 'tabler:building-bank', url: '/platform-admin/settlements', ready: true, roles: ['super_admin'] },
  { title: 'Refunds', icon: 'tabler:receipt-refund', url: '/platform-admin/refunds', ready: true, roles: ['super_admin'] },
  { title: 'Platform support', icon: 'tabler:headset', url: '/platform-admin/support', ready: true, roles: ['super_admin'] },
  { title: 'Announcements', icon: 'tabler:speakerphone', url: '/platform-admin/announcements', ready: true, roles: ['super_admin'] },
  { title: 'Audit logs', icon: 'tabler:history', url: '/platform-admin/audit-logs', ready: true, roles: ['super_admin'] },
  // Organisation admin
  { title: 'Users', icon: 'tabler:users', url: '/admin/users', ready: true, roles: ['org_admin'] },
  { title: 'Departments', icon: 'tabler:building-community', url: '/admin/departments', ready: true, roles: ['org_admin'] },
  { title: 'Support teams', icon: 'tabler:users-group', url: '/admin/teams', ready: true, roles: ['org_admin'] },
  { title: 'Billing', icon: 'tabler:credit-card', url: '/admin/billing', ready: true, roles: ['org_admin'] },
  { title: 'Platform support', icon: 'tabler:headset', url: '/admin/platform-support', ready: true, roles: ['org_admin'] },
  { title: 'Announcements', icon: 'tabler:speakerphone', url: '/admin/announcements', ready: true, roles: ['org_admin'] },
  { title: 'Organisation settings', icon: 'tabler:settings', url: '/admin/settings', ready: true, roles: ['org_admin'] },
  // Tickets (shared pages; the API scopes the data to the role)
  { title: 'Tickets', icon: 'tabler:ticket', url: '/tickets', ready: true, roles: ['org_admin', 'support_manager', 'technician', 'employee', 'customer'] },
  { title: 'Unassigned tickets', icon: 'tabler:inbox', url: '/tickets?view=unassigned', ready: true, roles: ['org_admin', 'support_manager', 'technician'] },
  { title: 'Create ticket', icon: 'tabler:circle-plus', url: '/tickets/create', ready: true, roles: ['employee', 'customer'] },
  { title: 'Reports', icon: 'tabler:chart-bar', url: '/reports', ready: true, roles: ['org_admin', 'support_manager'] },
  // Everyone
  { title: 'Notifications', icon: 'tabler:bell', url: '/notifications', ready: true, roles: ALL_ROLES },
  { title: 'My profile', icon: 'tabler:user', url: '/profile', ready: true, roles: ALL_ROLES },
]

export interface SidebarSection {
  heading: string
  children: { id: string; name: string; icon: string; url: string }[]
}

export function buildSidebar(role: Role): SidebarSection[] {
  const children = NAV_ITEMS.filter((i) => i.ready && (!i.roles || i.roles.includes(role))).map((i) => ({
    id: i.url,
    name: i.title,
    icon: i.icon,
    url: i.url === '__home__' ? ROLE_HOME[role] : i.url,
  }))
  return [{ heading: 'Menu', children }]
}

export const PROFILE_MENU: NavItem[] = [
  { title: 'My Profile', icon: 'tabler:user', url: '/profile', ready: true },
  { title: 'Notifications', icon: 'tabler:bell', url: '/notifications', ready: true },
  { title: 'Account Settings', icon: 'tabler:settings', url: '/settings?tab=appearance', ready: true },
  { title: 'Security', icon: 'tabler:lock', url: '/settings?tab=security', ready: true },
  { title: 'Notification Preferences', icon: 'tabler:bell-cog', url: '/settings?tab=notifications', ready: true },
  { title: 'Organisation Settings', icon: 'tabler:building', url: '/admin/settings', ready: true, roles: ['org_admin'] },
  { title: 'Billing and Subscription', icon: 'tabler:credit-card', url: '/admin/billing', ready: true, roles: ['org_admin'] },
  { title: 'Help and Support', icon: 'tabler:lifebuoy', url: '/contact', ready: true },
]

export function profileMenuFor(role: Role): NavItem[] {
  return PROFILE_MENU.filter((i) => i.ready && (!i.roles || i.roles.includes(role)))
}

/** Only follow in-app relative links from notification data. */
export function safeInternalUrl(url?: string | null): string | null {
  if (!url || !url.startsWith('/') || url.startsWith('//')) return null
  // Backslashes and control characters can be turned into "//host" by browsers, so refuse them.
  if (/[\\\u0000-\u001f]/.test(url)) return null
  return url
}

/** Which roles may open which area. UI convenience only: Laravel enforces the real rules. */
const PATH_ROLES: [string, Role[]][] = [
  ['/platform-admin', ['super_admin']],
  ['/admin', ['org_admin']],
  ['/support-manager', ['support_manager']],
  ['/it-support', ['technician']],
  ['/staff', ['employee']],
  ['/customer', ['customer']],
  ['/reports', ['org_admin', 'support_manager']],
  ['/tickets', ['org_admin', 'support_manager', 'technician', 'employee', 'customer']],
]

export function canAccessPath(role: Role, path: string): boolean {
  const rule = PATH_ROLES.find(([prefix]) => path === prefix || path.startsWith(prefix + '/'))
  return rule ? rule[1].includes(role) : true
}
