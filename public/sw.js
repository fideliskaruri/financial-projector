const CACHE_NAME = 'fp-v3'
const CACHE_PREFIX = 'fp-'
const APP_SHELL = ['/financial-projector/']
const NETWORK_FIRST_DESTINATIONS = new Set(['document', 'script', 'style', 'worker'])

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

async function cacheResponse(request, response) {
  if (!response.ok) {
    return response
  }

  const cache = await caches.open(CACHE_NAME)
  await cache.put(request, response.clone())
  return response
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request)
          const cache = await caches.open(CACHE_NAME)
          await cache.put(APP_SHELL[0], response.clone())
          return response
        } catch {
          return (await caches.match(APP_SHELL[0])) || Response.error()
        }
      })(),
    )
    return
  }

  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin) {
    return
  }

  if (NETWORK_FIRST_DESTINATIONS.has(event.request.destination)) {
    event.respondWith(
      (async () => {
        try {
          return await cacheResponse(event.request, await fetch(event.request))
        } catch {
          return (await caches.match(event.request)) || Response.error()
        }
      })(),
    )
    return
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request)
      if (cached) {
        return cached
      }

      try {
        return await cacheResponse(event.request, await fetch(event.request))
      } catch {
        return Response.error()
      }
    })(),
  )
})
