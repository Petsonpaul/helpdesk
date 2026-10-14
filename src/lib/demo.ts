import type { Role } from '@/types/auth'

/**
 * Demo mode: the app runs with built-in SAMPLE data and no backend, so it can be shown to other people.
 * Turn on with NEXT_PUBLIC_DEMO_MODE=true. Never enable it for a real product.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export const DEMO_ROLES: Role[] = ['super_admin', 'org_admin', 'support_manager', 'technician', 'employee', 'customer']
const KEY = 'qelvoro-demo-role'
let memoryRole: Role | null = null // used when there is no browser (tests)

export function getDemoRole(): Role | null {
  if (typeof window !== 'undefined') {
    try { const v = window.localStorage.getItem(KEY); return v && DEMO_ROLES.includes(v as Role) ? (v as Role) : null } catch { return null }
  }
  return memoryRole
}
export function setDemoRole(role: Role) {
  memoryRole = role
  try { window.localStorage.setItem(KEY, role) } catch { /* storage unavailable */ }
}
export function clearDemoRole() {
  memoryRole = null
  try { window.localStorage.removeItem(KEY) } catch { /* storage unavailable */ }
}
