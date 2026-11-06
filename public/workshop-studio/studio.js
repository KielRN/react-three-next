/* Standalone document: no analytics, URL credentials, storage or provider calls. */
(() => {
  const form = document.querySelector('#access-form')
  const code = document.querySelector('#access-code')
  const status = document.querySelector('#status')
  const logout = document.querySelector('#logout')
  const allowance = document.querySelector('#allowance')
  const results = document.querySelector('#results')
  const resultList = document.querySelector('#result-list')
  const resultsStatus = document.querySelector('#results-status')
  const refreshResults = document.querySelector('#refresh-results')
  const enabled = document.body.dataset.accessEnabled === 'true'
  let busy = false
  let revision = 0
  let jobsRevision = 0
  let safeController
  let privacyReady = !navigator.serviceWorker?.controller
  const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('txai-workshop-view') : null
  const options = { credentials: 'same-origin', cache: 'no-store', referrerPolicy: 'no-referrer' }
  const message = (value) => { status.textContent = value }
  const connectionMessage = () => privacyReady ? 'Unable to reach your studio. Please try again.'
    : 'Your browser needs a privacy update. Reconnect and reload this page before opening the studio.'
  async function privateNetwork() {
    const controller = navigator.serviceWorker?.controller || null
    if (safeController === controller) return controller
    if (controller) {
      privacyReady = false
      const safe = await new Promise((resolve) => {
        const bridge = new MessageChannel()
        const finish = (value) => { clearTimeout(timer); bridge.port1.close(); resolve(value) }
        const timer = setTimeout(() => finish(false), 1500)
        bridge.port1.onmessage = ({ data }) => finish(data?.type === 'TXAI_STUDIO_CACHE_READY' && data.version === 1 && data.safe === true)
        try { controller.postMessage({ type: 'TXAI_STUDIO_CACHE_GUARD', version: 1 }, [bridge.port2]) }
        catch { finish(false) }
      })
      if (!safe || navigator.serviceWorker.controller !== controller) {
        navigator.serviceWorker.getRegistration().then((registration) => registration?.update()).catch(() => {})
        throw new Error('Private network unavailable')
      }
    }
    safeController = controller
    privacyReady = true
    return controller
  }
  async function studioFetch(url, init = options) {
    const controller = await privateNetwork()
    if ((navigator.serviceWorker?.controller || null) !== controller) throw new Error('Private network changed')
    return fetch(url, init)
  }
  function signedOut() {
    ++jobsRevision
    allowance.hidden = true
    logout.hidden = true
    form.hidden = false
    form.querySelector('button').disabled = !enabled || busy || !privacyReady
    for (const id of ['available', 'held', 'spent', 'expiry']) document.getElementById(id).textContent = ''
    code.value = ''
    results.hidden = true
    resultList.replaceChildren()
    resultsStatus.textContent = ''
    refreshResults.disabled = false
  }
  async function loadJobs(version, jobVersion) {
    resultList.replaceChildren()
    results.hidden = false
    resultsStatus.textContent = 'Loading your videos…'
    const response = await studioFetch('/api/workshop-studio/jobs')
    if (version !== revision || jobVersion !== jobsRevision) return
    if (!response.ok) {
      if ([401, 403].includes(response.status)) { ++revision; signedOut(); message('Studio access is invalid or expired. Please check with your instructor.'); return }
      resultsStatus.textContent = 'Your videos could not be loaded. Please try refreshing.'
      return
    }
    const data = await response.json()
    if (version !== revision || jobVersion !== jobsRevision) return
    if (!Array.isArray(data.jobs) || data.jobs.length > 50) throw new Error('Invalid response')
    const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    const fragment = document.createDocumentFragment()
    for (const [index, job] of data.jobs.entries()) {
      if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(job.id) ||
        !Number.isSafeInteger(job.maximumCostCents) || job.maximumCostCents < 1 ||
        (job.actualCostCents !== null && (!Number.isSafeInteger(job.actualCostCents) || job.actualCostCents < 0))) throw new Error('Invalid response')
      const item = document.createElement('li')
      const title = document.createElement('h3')
      title.textContent = 'Video ' + (index + 1)
      const progress = document.createElement('p')
      progress.textContent = job.downloadReady === true ? 'Your video is ready to download.'
        : job.providerState === 'completed' ? 'Video created; a saved download is not available.'
          : ['failed', 'canceled', 'nsfw'].includes(job.providerState) ? 'This request did not complete.'
            : job.state === 'unknown' && !job.providerState ? 'Request outcome is not confirmed. Please contact your instructor.'
              : ['queued', 'in_progress'].includes(job.providerState) ? 'Your request is in progress.' : 'No completed video is available yet.'
      const cost = document.createElement('p')
      cost.className = 'result-cost'
      cost.textContent = job.actualCostCents === null ? 'Up to ' + money.format(job.maximumCostCents / 100) + ' reserved until billing is confirmed.'
        : job.actualCostCents === 0 ? 'No charge recorded.' : 'Confirmed usage: ' + money.format(job.actualCostCents / 100) + '.'
      item.append(title, progress, cost)
      if (job.downloadReady === true) {
        const link = document.createElement('a')
        link.className = 'download'
        link.textContent = 'Download video'
        link.setAttribute('aria-label', 'Download video ' + (index + 1))
        link.href = '/api/workshop-studio/jobs/' + job.id + '/download'
        link.rel = 'noreferrer'
        item.append(link)
      }
      fragment.append(item)
    }
    resultList.replaceChildren(fragment)
    resultsStatus.textContent = data.jobs.length ? '' : 'No video requests yet.'
  }
  function refreshJobs(version) {
    const jobVersion = ++jobsRevision
    loadJobs(version, jobVersion).catch(() => {
      if (version === revision && jobVersion === jobsRevision) { resultList.replaceChildren(); resultsStatus.textContent = 'Your videos could not be loaded. Please try refreshing.' }
    })
  }
  async function load(version) {
    const response = await studioFetch('/api/workshop-studio/session')
    if (version !== revision) return
    if (!response.ok) { signedOut(); message(response.status === 401 ? 'Enter your access code to continue.' : 'Studio access is not available. Please contact your instructor.'); return }
    const data = await response.json()
    if (version !== revision) return
    const values = [data.seat?.availableCents, data.seat?.heldCents, data.seat?.spentCents]
    const expiry = new Date(data.accessExpiresAt)
    if (data.currency !== 'USD' || values.some((n) => !Number.isSafeInteger(n) || n < 0) || !Number.isFinite(expiry.getTime())) throw new Error('Invalid response')
    const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    for (const [index, id] of ['available', 'held', 'spent'].entries()) document.getElementById(id).textContent = money.format(values[index] / 100)
    document.getElementById('expiry').textContent = 'Access ends ' + new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Chicago' }).format(expiry) + ' Central.'
    allowance.hidden = false
    logout.hidden = false
    form.hidden = true
    message('Your allowance is shown below. Generation is not available yet.')
    refreshJobs(version)
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (!enabled || busy) return
    busy = true
    const version = ++revision
    const button = form.querySelector('button')
    button.disabled = true
    const value = code.value
    code.value = ''
    try {
      const response = await studioFetch('/api/workshop-studio/session', { ...options, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: value }) })
      // The browser applies Set-Cookie independently of rendering revisions.
      // Notify other views even when a visibility change made this POST stale.
      if (response.ok) channel?.postMessage('access-changed')
      if (version !== revision) return
      if (!response.ok) { message(response.status === 401 ? 'That code is invalid or expired. Please check with your instructor.' : 'Studio access is not available yet.'); return }
      await load(version)
    } catch { channel?.postMessage('access-changed'); if (version === revision) { signedOut(); message(connectionMessage()) } }
    finally {
      busy = false
      button.disabled = !enabled || !privacyReady
      if (version !== revision) { signedOut(); message('Studio access changed while signing in. Reload to verify your current access.') }
    }
  })
  logout.addEventListener('click', async () => {
    if (busy) return
    busy = true
    ++revision
    signedOut()
    try {
      const response = await studioFetch('/api/workshop-studio/session', { ...options, method: 'DELETE' })
      message(response.ok ? 'You have signed out.' : 'Your browser view is cleared. Sign-out could not be confirmed; close this window and contact your instructor.')
    } catch { message('Your browser view is cleared. Sign-out could not be confirmed; close this window and contact your instructor.') }
    finally { busy = false; signedOut(); channel?.postMessage('access-changed') }
  })
  refreshResults.addEventListener('click', () => { if (!busy) refreshJobs(revision) })
  resultList.addEventListener('click', async (event) => {
    const link = event.target.closest('a.download')
    if (!link) return
    event.preventDefault()
    const version = revision
    try {
      const controller = await privateNetwork()
      if (version === revision && link.isConnected && (navigator.serviceWorker?.controller || null) === controller) window.location.assign(link.href)
    } catch { ++revision; signedOut(); message(connectionMessage()) }
  })
  function refresh() {
    const version = ++revision
    load(version).catch(() => { if (version === revision) { signedOut(); message(connectionMessage()) } })
  }
  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    safeController = undefined
    privacyReady = false
    ++revision; signedOut()
    if (enabled && !busy) refresh()
  })
  window.addEventListener('pagehide', () => { ++revision; signedOut() })
  document.addEventListener('visibilitychange', () => {
    ++revision; signedOut()
    if (document.visibilityState === 'visible' && enabled && !busy) refresh()
  })
  if (channel) channel.onmessage = () => { ++revision; signedOut(); message('Studio access changed in another window. Reload to continue.') }
  window.addEventListener('pageshow', (event) => { if (event.persisted) { signedOut(); if (enabled && !busy) refresh() } })
  if (enabled) refresh()
})()
