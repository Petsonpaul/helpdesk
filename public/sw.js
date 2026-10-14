/*
 * Qelvoro: service-worker kill switch.
 * An earlier version cached pages (including signed-in ones) and referenced pages that do not exist.
 * Caching signed-in content is a privacy risk on shared computers, so offline caching is switched off.
 * This file only removes the old cache and unregisters itself in browsers that still have the old worker.
 */
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
      await self.registration.unregister()
    })()
  )
})
