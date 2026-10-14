import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('api client', () => {
  beforeEach(() => { vi.resetModules(); process.env.NEXT_PUBLIC_API_URL = 'http://api.test'; process.env.NEXT_PUBLIC_API_PREFIX = '/api/v1' })
  afterEach(() => vi.unstubAllGlobals())

  it('sends cookies and does not fetch a CSRF cookie for GET', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    const { api } = await import('@/lib/api-client')
    await api.get('/me')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('http://api.test/api/v1/me')
    expect(init.credentials).toBe('include')
  })

  it('fetches the CSRF cookie before a POST', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, {}))
    vi.stubGlobal('fetch', fetchMock)
    const { api } = await import('@/lib/api-client')
    await api.post('/auth/logout')
    expect(String(fetchMock.mock.calls[0][0])).toContain('/sanctum/csrf-cookie')
    expect(String(fetchMock.mock.calls[1][0])).toContain('/auth/logout')
  })

  it('turns validation errors into ApiError with field errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(json(200, {})).mockResolvedValueOnce(json(422, { message: 'Invalid', errors: { email: ['Taken'] } })))
    const { api, ApiError } = await import('@/lib/api-client')
    await expect(api.post('/x', {})).rejects.toMatchObject({ status: 422, fieldErrors: { email: ['Taken'] } })
    expect(ApiError).toBeDefined()
  })

  it('reports an unreachable server as status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')))
    const { api } = await import('@/lib/api-client')
    await expect(api.get('/me')).rejects.toMatchObject({ status: 0 })
  })

  it('flags 401 as unauthenticated', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(401, { message: 'Unauthenticated.' })))
    const { api } = await import('@/lib/api-client')
    await expect(api.get('/me')).rejects.toMatchObject({ isUnauthenticated: true })
  })
})

describe('api client: session expiry signals', () => {
  beforeEach(() => { vi.resetModules(); process.env.NEXT_PUBLIC_API_URL = 'http://api.test'; process.env.NEXT_PUBLIC_API_PREFIX = '/api/v1' })
  afterEach(() => vi.unstubAllGlobals())

  it('emits a session-expired signal for a 401 on a normal request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(401, { message: 'Unauthenticated.' })))
    const events = await import('@/lib/auth-events')
    const { api } = await import('@/lib/api-client')
    const cb = vi.fn(); events.onSessionExpired(cb)
    await expect(api.get('/tickets')).rejects.toMatchObject({ status: 401 })
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('does NOT emit for a failed login (wrong password is not an expired session)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(json(200, {})).mockResolvedValueOnce(json(401, { message: 'Bad credentials' })))
    const events = await import('@/lib/auth-events')
    const { api } = await import('@/lib/api-client')
    const cb = vi.fn(); events.onSessionExpired(cb)
    await expect(api.post('/auth/login', {})).rejects.toMatchObject({ status: 401 })
    expect(cb).not.toHaveBeenCalled()
  })

  it('does NOT emit for network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    const events = await import('@/lib/auth-events')
    const { api } = await import('@/lib/api-client')
    const cb = vi.fn(); events.onSessionExpired(cb)
    await expect(api.get('/tickets')).rejects.toMatchObject({ status: 0 })
    expect(cb).not.toHaveBeenCalled()
  })

  it('retries once after a 419 with a fresh CSRF cookie, then succeeds', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(200, {}))            // csrf
      .mockResolvedValueOnce(json(419, { message: 'CSRF token mismatch.' }))
      .mockResolvedValueOnce(json(200, {}))            // csrf again
      .mockResolvedValueOnce(json(200, { ok: true }))  // retried request
    vi.stubGlobal('fetch', fetchMock)
    const { api } = await import('@/lib/api-client')
    await expect(api.post('/tickets', {})).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('asks the app to re-check the session after two 419 responses, without looping', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(200, {})).mockResolvedValueOnce(json(419, {}))
      .mockResolvedValueOnce(json(200, {})).mockResolvedValueOnce(json(419, {}))
    vi.stubGlobal('fetch', fetchMock)
    const events = await import('@/lib/auth-events')
    const { api } = await import('@/lib/api-client')
    const cb = vi.fn(); events.onSessionRecheck(cb)
    await expect(api.post('/tickets', {})).rejects.toMatchObject({ status: 419 })
    expect(cb).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})

describe('api client: subscription restriction', () => {
  beforeEach(() => { vi.resetModules(); process.env.NEXT_PUBLIC_API_URL = 'http://api.test'; process.env.NEXT_PUBLIC_API_PREFIX = '/api/v1' })
  afterEach(() => vi.unstubAllGlobals())

  it('re-checks /me on a 402 but does not sign the user out', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(402, { message: 'Subscription required', code: 'subscription_restricted' })))
    const events = await import('@/lib/auth-events')
    const { api } = await import('@/lib/api-client')
    const recheck = vi.fn(); const expired = vi.fn()
    events.onSessionRecheck(recheck); events.onSessionExpired(expired)
    await expect(api.get('/tickets')).rejects.toMatchObject({ status: 402 })
    expect(recheck).toHaveBeenCalledTimes(1)
    expect(expired).not.toHaveBeenCalled()
  })
})

describe('api client: customer portal switch', () => {
  beforeEach(() => { vi.resetModules(); process.env.NEXT_PUBLIC_API_URL = 'http://api.test'; process.env.NEXT_PUBLIC_API_PREFIX = '/api/v1' })
  afterEach(() => vi.unstubAllGlobals())

  it('re-checks /me when the portal is disabled, and exposes the error code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(403, { message: 'Portal disabled', code: 'customer_portal_disabled' })))
    const events = await import('@/lib/auth-events')
    const { api } = await import('@/lib/api-client')
    const recheck = vi.fn(); events.onSessionRecheck(recheck)
    await expect(api.get('/tickets')).rejects.toMatchObject({ status: 403, code: 'customer_portal_disabled' })
    expect(recheck).toHaveBeenCalledTimes(1)
  })
})
