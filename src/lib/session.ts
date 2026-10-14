import { safeInternalUrl } from './permissions'

/** Login, register and password endpoints return 401/422 for normal reasons (wrong password...), never "session expired". */
export function isAuthEndpoint(path: string): boolean {
  return path.startsWith('/auth/')
}

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

/** Returns an in-app path that is safe to send the user back to after signing in, or null. Never returns an auth page (prevents redirect loops). */
export function safeNextPath(next?: string | null): string | null {
  const safe = safeInternalUrl(next)
  if (!safe) return null
  const pathOnly = safe.split(/[?#]/)[0]
  if (AUTH_PAGES.some((p) => pathOnly === p || pathOnly.startsWith(p + '/'))) return null
  return safe
}

export function buildLoginUrl({ expired, next }: { expired?: boolean; next?: string | null }): string {
  const q = new URLSearchParams()
  if (expired) q.set('reason', 'expired')
  const n = safeNextPath(next)
  if (n) q.set('next', n)
  const s = q.toString()
  return s ? `/login?${s}` : '/login'
}
