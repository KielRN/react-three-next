// First-match Workbox rule: private documents/session data must never enter a
// shared runtime cache, including authenticated HTTP errors and offline fallback.
module.exports = function privateStudioRequest({ sameOrigin, url }) {
  if (!sameOrigin) return false
  let paths
  try {
    const decoded = decodeURIComponent(url.pathname).replace(/\\/g, '/').replace(/\/{2,}/g, '/')
    paths = [decoded, new URL(decoded, url.origin).pathname]
  } catch { return false }
  return paths.some((path) => path === '/workshops/studio' || path.startsWith('/workshops/studio/') ||
    path === '/api/workshop-studio' || path.startsWith('/api/workshop-studio/'))
}
