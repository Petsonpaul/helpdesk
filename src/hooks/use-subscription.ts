'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './use-auth'
import { emitSessionRecheck } from '@/lib/auth-events'
import { bannerFor, remainingMs, serverOffsetMs } from '@/lib/subscription'

const TICK_MS = 60_000

/** Subscription display state. The countdown is for display; the server's `access` value decides restriction. */
export function useSubscription() {
  const { user } = useAuth()
  const sub = user?.subscription ?? null
  const [now, setNow] = useState(() => Date.now())
  const offset = useMemo(() => serverOffsetMs(sub?.server_time), [sub])
  const lastRecheck = useRef(0)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(t)
  }, [])

  // If the countdown hits zero here, ask the server again (at most once a minute) instead of deciding locally.
  useEffect(() => {
    if (sub?.status !== 'trialing' || sub.access !== 'full') return
    const ms = remainingMs(sub.trial_ends_at, offset, now)
    if (ms !== null && ms <= 0 && Date.now() - lastRecheck.current >= TICK_MS) {
      lastRecheck.current = Date.now()
      emitSessionRecheck()
    }
  }, [sub, offset, now])

  return { sub, banner: bannerFor(sub, offset, now) }
}
