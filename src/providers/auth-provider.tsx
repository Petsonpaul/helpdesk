'use client'

import { createContext, useCallback, useEffect, useMemo, useRef, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { ApiError } from '@/lib/api-client'
import { onSessionExpired, onSessionRecheck } from '@/lib/auth-events'
import { DEV_PREVIEW, devPreviewUser } from '@/lib/dev-preview'
import { buildLoginUrl } from '@/lib/session'
import { getMe, logout as apiLogout } from '@/services/auth.service'
import type { AuthUser } from '@/types/auth'

type Status = 'loading' | 'authenticated' | 'unauthenticated' | 'error'
interface AuthContextValue {
  user: AuthUser | null
  status: Status
  errorMessage: string
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Loads the signed-in user from Laravel (the server is the source of truth).
 * It also reacts when ANY request later reports "not signed in" (401): it clears client data and
 * sends the person to /login exactly once, remembering where they were so they can come back.
 * Loop safety: this provider only exists inside the signed-in area, only reacts while status is
 * "authenticated", redirects at most once per sign-out, and never redirects to an auth page as "next".
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { mutate: swrMutate } = useSWRConfig()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const statusRef = useRef<Status>('loading')
  const redirecting = useRef(false)
  const rechecking = useRef(false)

  const setStatusBoth = useCallback((s: Status) => { statusRef.current = s; setStatus(s) }, [])

  const goToLogin = useCallback((opts: { expired: boolean; keepNext: boolean }) => {
    if (redirecting.current) return // several failing requests must cause one redirect
    redirecting.current = true
    const here = typeof window !== 'undefined' ? window.location.pathname + window.location.search : null
    router.replace(buildLoginUrl({ expired: opts.expired, next: opts.keepNext ? here : null }))
  }, [router])

  const endSession = useCallback((opts: { expired: boolean; keepNext: boolean }) => {
    setUser(null)
    setStatusBoth('unauthenticated')
    swrMutate(() => true, undefined, { revalidate: false }) // forget the previous person's cached data
    goToLogin(opts)
  }, [goToLogin, setStatusBoth, swrMutate])

  const refresh = useCallback(async () => {
    try {
      const me = await getMe()
      redirecting.current = false
      setUser(me); setStatusBoth('authenticated'); setErrorMessage('')
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthenticated) {
        endSession({ expired: statusRef.current === 'authenticated', keepNext: true })
      } else if (DEV_PREVIEW) {
        setUser(devPreviewUser()); setStatusBoth('authenticated')
      } else {
        setStatusBoth('error')
        setErrorMessage(err instanceof ApiError ? err.message : 'Something went wrong.')
      }
    }
  }, [endSession, setStatusBoth])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const offExpired = onSessionExpired(() => {
      if (statusRef.current === 'authenticated') endSession({ expired: true, keepNext: true })
    })
    const offRecheck = onSessionRecheck(async () => {
      if (statusRef.current !== 'authenticated' || rechecking.current) return
      rechecking.current = true
      try {
        const me = await getMe()
        setUser(me) // still signed in: nothing else to do
      } catch (err) {
        if (err instanceof ApiError && err.isUnauthenticated) endSession({ expired: true, keepNext: true })
        // other errors (e.g. offline) do not sign the person out
      } finally { rechecking.current = false }
    })
    return () => { offExpired(); offRecheck() }
  }, [endSession])

  const logout = useCallback(async () => {
    try { await apiLogout() } catch { /* even if the call fails, leave the signed-in area */ }
    endSession({ expired: false, keepNext: false })
  }, [endSession])

  const value = useMemo(() => ({ user, status, errorMessage, refresh, logout }), [user, status, errorMessage, refresh, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
