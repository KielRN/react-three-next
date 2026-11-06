/* Imported by the generated worker. Never reads cached response bodies. */
(() => {
  function privateRequest(request) {
    const url = new URL(request.url)
    if (url.origin !== self.location.origin) return false
    let paths
    try {
      const decoded = decodeURIComponent(url.pathname).replace(/\\/g, '/').replace(/\/{2,}/g, '/')
      paths = [decoded, new URL(decoded, url.origin).pathname]
    } catch { return false }
    return paths.some((path) => path === '/workshops/studio' || path.startsWith('/workshops/studio/') ||
      path === '/api/workshop-studio' || path.startsWith('/api/workshop-studio/'))
  }
  async function purgePrivateEntries() {
    for (const name of await caches.keys()) {
      const cache = await caches.open(name)
      for (const request of await cache.keys()) {
        if (privateRequest(request)) {
          await cache.delete(request)
          if (await cache.match(request)) throw new Error('Private cache cleanup incomplete')
        }
      }
    }
  }
  self.addEventListener('activate', (event) => event.waitUntil(purgePrivateEntries()))
  self.addEventListener('message', (event) => {
    if (event.data?.type !== 'TXAI_STUDIO_CACHE_GUARD' || event.data.version !== 1 || !event.ports?.[0]) return
    const port = event.ports[0]
    event.waitUntil(purgePrivateEntries().then(
      () => port.postMessage({ type: 'TXAI_STUDIO_CACHE_READY', version: 1, safe: true }),
      () => port.postMessage({ type: 'TXAI_STUDIO_CACHE_READY', version: 1, safe: false }),
    ).finally(() => port.close()))
  })
})()
