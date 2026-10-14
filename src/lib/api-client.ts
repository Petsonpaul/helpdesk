import type { ApiErrorBody } from '@/types/api'
import { ApiError } from '@/lib/api-error'
import { DEMO_MODE } from '@/lib/demo'
import { emitSessionExpired, emitSessionRecheck } from '@/lib/auth-events'
import { isAuthEndpoint } from '@/lib/session'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''
const PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? '/api/v1'

export { ApiError }

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

let csrfReady = false
/** Laravel Sanctum (cookie auth): fetch the CSRF cookie once before state-changing requests. */
export async function ensureCsrfCookie(): Promise<void> {
  if (csrfReady) return
  await fetch(`${BASE}/sanctum/csrf-cookie`, { credentials: 'include' })
  csrfReady = true
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export async function apiRequest<T>(
  method: Method,
  path: string,
  body?: unknown,
  init: { signal?: AbortSignal; query?: Record<string, string | number | undefined> } = {}
): Promise<T> {
  if (DEMO_MODE) {
    const { demoRequest } = await import('@/demo/api')
    return demoRequest<T>(method, path, body, init.query)
  }

  const url = new URL(`${BASE}${PREFIX}${path}`, typeof window === 'undefined' ? 'http://localhost' : undefined)
  Object.entries(init.query ?? {}).forEach(([k, v]) => v !== undefined && url.searchParams.set(k, String(v)))
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData

  async function send(): Promise<Response> {
    if (method !== 'GET') await ensureCsrfCookie()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'
    const xsrf = readCookie('XSRF-TOKEN') // read fresh each time so a retry uses the new token
    if (xsrf) headers['X-XSRF-TOKEN'] = xsrf
    try {
      return await fetch(url.toString(), {
        method,
        headers,
        credentials: 'include', // session cookie; no tokens in localStorage
        signal: init.signal,
        body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
      })
    } catch {
      // Network problems are NOT a sign-out: keep the user signed in and show an error.
      throw new ApiError(0, 'Unable to reach the server. Check your connection and try again.')
    }
  }

  let res = await send()

  // 419 = stale CSRF token. Fetch a new one and retry exactly once.
  if (res.status === 419 && method !== 'GET') {
    csrfReady = false
    res = await send()
    if (res.status === 419) {
      csrfReady = false
      emitSessionRecheck() // the app re-checks /me to learn whether the session is really gone
      throw new ApiError(419, 'Your session expired or this page is out of date. Please refresh and try again.')
    }
  }

  if (res.status === 204) return undefined as T
  const data = (await res.json().catch(() => null)) as (ApiErrorBody & T) | null

  if (!res.ok) {
    // 401 on a normal request means the session has ended. Login/register/password calls are excluded
    // because they return 401/422 for ordinary reasons (wrong password).
    if (res.status === 401 && !isAuthEndpoint(path)) emitSessionExpired()
    // 402 = the organisation's subscription blocks this feature. Re-check /me so the UI shows the restriction.
    if (res.status === 402) emitSessionRecheck()
    // 403 with this code = the organisation switched its customer portal off. Re-check /me so the UI explains it.
    if (res.status === 403 && data?.code === 'customer_portal_disabled') emitSessionRecheck()
    throw new ApiError(res.status, data?.message ?? `Request failed (${res.status})`, data?.errors ?? {}, data?.code)
  }
  return data as T
}

export const api = {
  get: <T>(p: string, query?: Record<string, string | number | undefined>, signal?: AbortSignal) =>
    apiRequest<T>('GET', p, undefined, { query, signal }),
  post: <T>(p: string, b?: unknown) => apiRequest<T>('POST', p, b),
  put: <T>(p: string, b?: unknown) => apiRequest<T>('PUT', p, b),
  patch: <T>(p: string, b?: unknown) => apiRequest<T>('PATCH', p, b),
  delete: <T>(p: string) => apiRequest<T>('DELETE', p),
}
