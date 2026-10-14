'use client'

import { useEffect } from 'react'

/** Removes any old service worker and its caches (see public/sw.js). It no longer registers a worker. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {})
    if ('caches' in window) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {})
  }, [])
  return null
}
