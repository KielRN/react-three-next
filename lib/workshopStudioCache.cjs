// First-match Workbox rule: private documents/session data must never enter a
// shared runtime cache, including authenticated HTTP errors and offline fallback.
module.exports = function privateStudioRequest({ sameOrigin, url }) {
  return sameOrigin && (url.pathname === '/workshops/studio' || url.pathname.startsWith('/workshops/studio/') ||
    url.pathname === '/api/workshop-studio' || url.pathname.startsWith('/api/workshop-studio/'))
}
