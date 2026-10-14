import { describe, expect, it } from 'vitest'
import { buildSidebar, canAccessPath, profileMenuFor, safeInternalUrl, ROLE_HOME, NAV_ITEMS } from '@/lib/permissions'
import type { Role } from '@/types/auth'

describe('role navigation', () => {
  it('gives each role only its own menu items', () => {
    const admin = buildSidebar('super_admin')[0].children.map((c) => c.url)
    expect(admin).toContain('/platform-admin/organizations')
    expect(admin).not.toContain('/admin/users')
    const employee = buildSidebar('employee')[0].children.map((c) => c.url)
    expect(employee).toContain('/tickets/create')
    expect(employee).not.toContain('/reports')
  })
  it('points Dashboard at the role home', () => {
    expect(buildSidebar('technician')[0].children[0].url).toBe(ROLE_HOME.technician)
  })
  it('shows billing in the profile menu only for org admins', () => {
    expect(profileMenuFor('org_admin').some((i) => i.url === '/admin/billing')).toBe(true)
    expect(profileMenuFor('employee').some((i) => i.url === '/admin/billing')).toBe(false)
  })
})

describe('canAccessPath', () => {
  it('blocks other roles areas', () => {
    expect(canAccessPath('employee', '/platform-admin/payments')).toBe(false)
    expect(canAccessPath('super_admin', '/platform-admin/payments')).toBe(true)
    expect(canAccessPath('technician', '/admin/users')).toBe(false)
    expect(canAccessPath('employee', '/tickets/12')).toBe(true)
    expect(canAccessPath('super_admin', '/tickets')).toBe(false)
  })
  it('allows shared pages for everyone', () => {
    for (const r of ['super_admin', 'org_admin', 'support_manager', 'technician', 'employee', 'customer'] as const) {
      expect(canAccessPath(r, '/profile')).toBe(true)
      expect(canAccessPath(r, '/notifications')).toBe(true)
    }
  })
})

describe('safeInternalUrl', () => {
  it('accepts in-app paths only', () => {
    expect(safeInternalUrl('/tickets/5')).toBe('/tickets/5')
    expect(safeInternalUrl('https://evil.example')).toBeNull()
    expect(safeInternalUrl('//evil.example')).toBeNull()
    expect(safeInternalUrl('javascript:alert(1)')).toBeNull()
    expect(safeInternalUrl(null)).toBeNull()
  })
})

const ROLES: Role[] = ['super_admin', 'org_admin', 'support_manager', 'technician', 'employee', 'customer']

describe('role URLs', () => {
  it('uses the agreed, unique home URL for each role', () => {
    expect(ROLE_HOME).toEqual({
      super_admin: '/platform-admin', org_admin: '/admin', support_manager: '/support-manager',
      technician: '/it-support', employee: '/staff', customer: '/customer',
    })
    expect(new Set(Object.values(ROLE_HOME)).size).toBe(ROLES.length)
  })
  it('lets each role open its own area and no other role-specific area', () => {
    for (const role of ROLES) {
      for (const other of ROLES) expect(canAccessPath(role, ROLE_HOME[other])).toBe(role === other)
    }
  })
  it('every menu item a role sees is a page that role may open', () => {
    for (const role of ROLES) {
      for (const item of buildSidebar(role)[0].children) expect(canAccessPath(role, item.url.split('?')[0])).toBe(true)
    }
  })
  it('keeps retired URL names out of the page menus', () => {
    expect(NAV_ITEMS.some((i) => i.url.startsWith('/super-admin') || i.url.startsWith('/org-admin') || i.url.startsWith('/organization') || i.url.startsWith('/technician') || i.url.startsWith('/employee'))).toBe(false)
  })
})
