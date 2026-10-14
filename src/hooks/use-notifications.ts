'use client'
import useSWR from 'swr'
import { useCallback, useEffect, useRef } from 'react'
import { getUnreadCount, listNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/notification.service'
import { getNotificationPreferences, saveNotificationPreferences } from '@/services/profile.service'
import { armSoundUnlock, playChime, shouldPlaySound, unlockSound } from '@/lib/sound'

/**
 * Notifications via the API with polling (every 60s, paused while the tab is hidden).
 * This is polling, not real-time push; WebSocket broadcasting is added in a later phase.
 */
export function useNotifications() {
  const list = useSWR(['notifications', 'recent'], () => listNotifications('all', 1, 6), { refreshInterval: 60000, refreshWhenHidden: false, shouldRetryOnError: false })
  const count = useSWR('notifications-unread', getUnreadCount, { refreshInterval: 60000, refreshWhenHidden: false, shouldRetryOnError: false })
  const prefs = useSWR('notification-prefs', getNotificationPreferences, { shouldRetryOnError: false })
  const { mutate: mutatePrefs } = prefs
  const { mutate: mutateList } = list
  const { mutate: mutateCount } = count

  const markRead = useCallback(async (id: string) => {
    try { await markNotificationRead(id) } finally { mutateList(); mutateCount() }
  }, [mutateList, mutateCount])
  const markAll = useCallback(async () => {
    try { await markAllNotificationsRead() } finally { mutateList(); mutateCount() }
  }, [mutateList, mutateCount])

  // Sound for NEW unread notifications only (never for the first load). Plays only while the app is open.
  const seen = useRef<Set<string> | null>(null)
  const items = list.data?.data
  const soundPrefs = prefs.data
  useEffect(() => { if (soundPrefs?.sound) armSoundUnlock() }, [soundPrefs?.sound])
  useEffect(() => {
    if (!items) return
    if (seen.current === null) { seen.current = new Set(items.map((n) => n.id)); return }
    const fresh = items.filter((n) => !n.read_at && !seen.current!.has(n.id))
    items.forEach((n) => seen.current!.add(n.id))
    if (fresh.length && shouldPlaySound(soundPrefs, fresh.some((n) => n.urgent))) playChime()
  }, [items, soundPrefs])

  const soundEnabled = !!prefs.data?.sound
  const toggleSound = useCallback(async () => {
    if (!prefs.data) return
    await unlockSound() // this click is the user gesture browsers require
    await saveNotificationPreferences({ ...prefs.data, sound: !prefs.data.sound })
    await mutatePrefs()
  }, [prefs.data, mutatePrefs])

  return {
    soundEnabled,
    soundAvailable: !!prefs.data,
    toggleSound,
    items: list.data?.data ?? [],
    unread: count.data ?? 0,
    loading: list.isLoading,
    error: list.error ? (list.error as Error).message : '',
    markRead,
    markAll,
    refresh: () => { mutateList(); mutateCount() },
  }
}
