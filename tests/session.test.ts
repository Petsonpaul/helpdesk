import { describe, expect, it } from 'vitest'
import { buildLoginUrl, isAuthEndpoint, safeNextPath } from '@/lib/session'
import { safeInternalUrl } from '@/lib/permissions'

describe('safeNextPath', () => {
  it('keeps normal in-app paths, including query strings', () => {
    expect(safeNextPath('/tickets/12')).toBe('/tickets/12')
    expect(safeNextPath('/tickets?status=open')).toBe('/tickets?status=open')
  })
  it('never returns an auth page (prevents login redirect loops)', () => {
    for (const p of ['/login', '/login?next=/x', '/register', '/forgot-password', '/reset-password', '/verify-email']) expect(safeNextPath(p)).toBeNull()
  })
  it('rejects external and tricky targets', () => {
    for (const p of ['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '', null, undefined, '/a\nb']) expect(safeNextPath(p as string | null | undefined)).toBeNull()
  })
})

describe('buildLoginUrl', () => {
  it('builds plain, expired and next URLs', () => {
    expect(buildLoginUrl({})).toBe('/login')
    expect(buildLoginUrl({ expired: true })).toBe('/login?reason=expired')
    expect(buildLoginUrl({ expired: true, next: '/tickets/5' })).toBe('/login?reason=expired&next=%2Ftickets%2F5')
  })
  it('drops an unsafe or looping next', () => {
    expect(buildLoginUrl({ expired: true, next: '/login' })).toBe('/login?reason=expired')
    expect(buildLoginUrl({ next: 'https://evil.example' })).toBe('/login')
  })
})

describe('isAuthEndpoint', () => {
  it('treats /auth/* as ordinary auth calls, not session expiry', () => {
    expect(isAuthEndpoint('/auth/login')).toBe(true)
    expect(isAuthEndpoint('/auth/logout')).toBe(true)
    expect(isAuthEndpoint('/me')).toBe(false)
    expect(isAuthEndpoint('/tickets')).toBe(false)
  })
})

describe('safeInternalUrl (hardened)', () => {
  it('rejects backslash and control-character tricks', () => {
    expect(safeInternalUrl('/\\evil.example')).toBeNull()
    expect(safeInternalUrl('/ok\u0000bad')).toBeNull()
    expect(safeInternalUrl('/tickets/5')).toBe('/tickets/5')
  })
})
